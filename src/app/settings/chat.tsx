import { useEffect, useRef, useState } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, TextInput, View } from 'react-native';
import { useAuth } from '../../state/AuthProvider';
import { useKitchen } from '../../state/KitchenProvider';
import { AppText as Text } from '../../ui/AppText';
import { Action, Notice, usePalette } from '../../ui/common';
import { SettingsPage } from '../../ui/settings';
import { RecipeEditor } from '../../ui/RecipeEditor';
import { recipeDraftFromAnswer, type SavedRecipe } from '../../domain/savedRecipes';
import { chatEndpoint } from '../../config/chat';
import { ChatError, chatErrorMessage, chatLimits, decodeChatRequest, type ChatMessage, type ChatRequest } from '../../domain/chat';
import { chatClient } from '../../services/chat';

export default function ChatScreen() {
  const { account } = useAuth();
  return <Conversation key={account?.uid ?? 'guest'} uid={account?.uid ?? null} />;
}
function Conversation({ uid }: { uid: string | null }) {
  const c = usePalette(), { state, chatDraft: draft, setChatDraft: setDraft } = useKitchen();
  const [messages, setMessages] = useState<ChatMessage[]>([]), [recipeDraft, setRecipeDraft] = useState<SavedRecipe | null>(null);
  const [savedMessage, setSavedMessage] = useState('');
  const [editingMessage, setEditingMessage] = useState<number | null>(null);
  const [sharePantry, setSharePantry] = useState(false), [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false), [error, setError] = useState<unknown>(null), [remaining, setRemaining] = useState<number | null>(null);
  const active = useRef<AbortController | null>(null), pending = useRef<ChatRequest | null>(null), alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; active.current?.abort(); }; }, []);
  async function send(retry = false) {
    if (!uid || active.current || !consent || !chatEndpoint) return;
    let request: ChatRequest;
    try {
      if (retry && pending.current) request = pending.current;
      else {
        let history = messages.slice(-chatLimits.history);
        while (history.length && history.reduce((size, m) => size + m.text.length, draft.length) > chatLimits.totalCharacters) history = history.slice(2);
        request = decodeChatRequest({ version: 1, requestId: `chat_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}_${Math.random().toString(36).slice(2)}`,
          messages: [...history, { role: 'user', text: draft }], ...(sharePantry ? { pantry: [...state.pantry], customPantry: state.customIngredients.filter(r => r.pantry).map(r => r.name) } : {}) });
      }
    } catch (cause) { setError(cause); return; }
    pending.current = request;
    const controller = new AbortController(); active.current = controller; setBusy(true); setError(null);
    try {
      const reply = await chatClient.send(uid, request, controller.signal);
      if (!alive.current) return;
      setMessages(value => [...value.slice(-18), request.messages[request.messages.length - 1], { role: 'model', text: reply.text }]);
      setRemaining(reply.remaining); setDraft(''); pending.current = null;
    } catch (cause) { if (alive.current) { setError(cause); if (!(cause instanceof ChatError) || cause.code !== 'NETWORK') pending.current = null; } }
    finally { active.current = null; if (alive.current) setBusy(false); }
  }
  return <SettingsPage title="Asistente de cocina" subtitle="Pregunta sobre recetas y sobre cómo usar ¿Qué cocino?.">
    {!uid ? <><Notice>Inicia sesión con Google para utilizar el asistente.</Notice><Action label="Ir a Perfil" onPress={() => router.push('/settings/profile')} /></> : <>
      {!chatEndpoint ? <Notice>El servidor del asistente todavía no está configurado.</Notice> : null}
      <Notice>Tus consultas y últimas respuestas se envían a Gemini mediante nuestro servidor. La conversación se conserva mientras esta pantalla está abierta. El borrador queda en memoria al salir; se borra al cambiar de cuenta o cerrar la app. El asistente puede equivocarse.</Notice>
      <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: consent, disabled: busy }} disabled={busy} onPress={() => setConsent(x => !x)} style={{ padding: 14, minHeight: 50, borderWidth: 1, borderRadius: 14, borderColor: c.border }}><Text style={{ color: c.text }}>{consent ? '✓ ' : '○ '}Acepto enviar mis consultas a Gemini</Text></Pressable>
      <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: sharePantry, disabled: busy }} disabled={busy} onPress={() => { pending.current = null; setError(null); if (sharePantry) { setMessages([]); setRecipeDraft(null); setDraft(''); } setSharePantry(x => !x); }} style={{ padding: 14, minHeight: 50, borderWidth: 1, borderRadius: 14, borderColor: c.border }}><Text style={{ color: c.text }}>{sharePantry ? '✓ ' : '○ '}Compartir los ingredientes de mi despensa</Text></Pressable>
      {sharePantry ? <Notice>Se envían los ingredientes marcados del catálogo y los nombres de tus ingredientes personalizados, sin cantidades, tu nombre, correo, favoritas ni compras. Al desactivar se borra esta conversación y su borrador.</Notice> : null}
      {!messages.length ? <View style={{ gap: 8 }}>{['Dame una receta para dos personas con título, sección Ingredientes y sección Pasos, cada elemento en una línea.', '¿Qué puedo cocinar en 15 minutos?', '¿Cómo paso mis compras a la despensa?'].map(text => <Action key={text} label={text} secondary disabled={busy} onPress={() => { pending.current = null; setDraft(text); }} />)}</View> : null}
      {savedMessage ? <Notice>{savedMessage}</Notice> : null}
      {messages.map((message, index) => <View key={index} style={{ padding: 16, gap: 8, borderRadius: 16, backgroundColor: message.role === 'user' ? c.soft : c.card }}>
        <Text style={{ color: c.green, fontWeight: '600' }}>{message.role === 'user' ? 'Tú' : 'Asistente · Gemini'}</Text><Text selectable style={{ color: c.text, fontSize: 15, lineHeight: 24 }}>{message.text}</Text>
        {message.role === 'model' ? <Action label="Revisar como receta para guardar" secondary disabled={busy} onPress={() => { setEditingMessage(index); setSavedMessage(''); setRecipeDraft(recipeDraftFromAnswer(message.text)); }} /> : null}
        {recipeDraft && editingMessage === index ? <RecipeEditor key={recipeDraft.id} initial={recipeDraft} onClose={saved => { setRecipeDraft(null); setSavedMessage(saved ? 'Receta guardada en Favoritas → Mis recetas.' : ''); }} /> : null}
      </View>)}
      <TextInput accessibilityLabel="Tu consulta para el asistente" placeholder="Escribe tu consulta" placeholderTextColor={c.muted} value={draft} onChangeText={value => { setDraft(value); pending.current = null; }} multiline maxLength={chatLimits.input} editable={!busy} style={{ padding: 14, minHeight: 110, textAlignVertical: 'top', borderRadius: 14, borderWidth: 1, borderColor: c.border, backgroundColor: c.card, color: c.text, fontSize: 16 }} />
      <Text style={{ color: c.muted }}>{draft.length}/1.000 caracteres · Hasta 10 consultas al día y 2 por minuto.</Text>
      {remaining !== null ? <Text style={{ color: c.muted }}>Cupo restante al responder: {remaining}. Se renueva a las 00:00 UTC.</Text> : null}
      {busy ? <ActivityIndicator color={c.green} accessibilityLabel="Esperando respuesta de Gemini" /> : null}
      {error ? <Notice error>{chatErrorMessage(error)}</Notice> : null}
      {error && pending.current ? <Action label="Reintentar la misma solicitud" secondary disabled={busy || !consent} onPress={() => { void send(true); }} /> : null}
      <Action label={busy ? 'Consultando…' : recipeDraft ? 'Termina de revisar la receta' : 'Enviar consulta'} disabled={busy || !!recipeDraft || !consent || !chatEndpoint || !draft.trim()} onPress={() => { void send(!!pending.current); }} />
      {messages.length || draft ? <Action label="Borrar conversación y borrador" secondary disabled={busy} onPress={() => { setMessages([]); setDraft(''); setRecipeDraft(null); pending.current = null; setError(null); }} /> : null}
    </>}
  </SettingsPage>;
}
