import { useEffect, useState } from 'react';
import { AppState, TextInput } from 'react-native';
import { AppText as Text } from './AppText';
import { Action, Notice, Section, usePalette } from './common';

export function CookingMode({ steps }: { steps: string[] }) {
  const c = usePalette();
  const [open, setOpen] = useState(false), [step, setStep] = useState(0), [minutes, setMinutes] = useState('5');
  const [deadline, setDeadline] = useState<number | null>(null), [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!deadline) return;
    const update = () => setNow(Date.now());
    const interval = setInterval(update, 1000), listener = AppState.addEventListener('change', update);
    return () => { clearInterval(interval); listener.remove(); };
  }, [deadline]);
  const seconds = deadline ? Math.max(0, Math.ceil((deadline - now) / 1000)) : 0;
  const valid = Number(minutes.replace(',', '.'));
  return <Section title="Modo cocina">
    <Action label={open ? 'Cerrar modo cocina' : 'Cocinar paso a paso'} onPress={() => setOpen(x => !x)} secondary />
    {open ? <>
      <Text accessibilityRole="header" style={{ color: c.green }}>Paso {step + 1} de {steps.length}</Text>
      <Text style={{ color: c.text, fontSize: 22, lineHeight: 32 }}>{steps[step]}</Text>
      <Action label="Paso anterior" disabled={step === 0} secondary onPress={() => setStep(x => x - 1)} />
      <Action label={step === steps.length - 1 ? 'Terminar receta' : 'Completar y seguir'} onPress={() => { if (step === steps.length - 1) { setOpen(false); setStep(0); setDeadline(null); } else setStep(x => x + 1); }} />
      <Text style={{ color: c.muted }}>Temporizador en minutos (1 a 180)</Text>
      <TextInput accessibilityLabel="Minutos del temporizador" keyboardType="decimal-pad" value={minutes} maxLength={5} onChangeText={setMinutes} style={{ color: c.text, borderColor: c.border, borderWidth: 1, borderRadius: 12, padding: 14 }} />
      <Action label="Iniciar temporizador" disabled={!Number.isFinite(valid) || valid < 1 || valid > 180} onPress={() => { const time = Date.now(); setNow(time); setDeadline(time + valid * 60000); }} />
      {deadline ? <><Text accessibilityLiveRegion={seconds === 0 ? 'polite' : 'none'} style={{ color: c.text, fontSize: 24 }}>{seconds ? `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}` : '¡Tiempo cumplido!'}</Text><Action label="Cancelar temporizador" secondary onPress={() => setDeadline(null)} /></> : null}
      <Notice>El temporizador mantiene la hora al volver a la app. No emite alarmas ni notificaciones con la app cerrada. Al salir de esta receta se cancela.</Notice>
    </> : null}
  </Section>;
}
