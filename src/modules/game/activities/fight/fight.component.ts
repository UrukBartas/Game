// Añadir importación para los efectos de clase
import { ClassPasives } from '../../../../../shared/enums/class-passives.enum';

// En el método que procesa los efectos de turno
processEffects(effects: any[]): void {
  if (!effects || effects.length === 0) return;

  effects.forEach(effect => {
    switch (effect.type) {
      // Efectos existentes...

      // Efectos de clase
      case ClassPasives.BERSEKER_RAGE:
        this.showEffect('Berserker Rage', `+${effect.value}% damage`, 'assets/misc/class_traits/BERSERKER_RAGE.webp');
        break;

      case ClassPasives.ARCANE_MASTERY:
        this.showEffect('Arcane Mastery', `${effect.value} magic damage`, 'assets/misc/class_traits/ARCANE_MASTERY.webp');
        break;

      case ClassPasives.BACKSTAB:
        this.showEffect('Backstab', 'Armor ignored', 'assets/misc/class_traits/BACKSTAB.webp');
        break;

      case ClassPasives.SOUL_REAPER:
        this.showEffect('Soul Reaper', `Stole ${effect.value} health`, 'assets/misc/class_traits/SOUL_REAPER.webp');
        break;
    }
  });
}

// Método para mostrar efectos visuales
showEffect(name: string, description: string, image: string): void {
  // Implementación para mostrar el efecto visualmente
  // Esto podría ser una animación, un texto flotante, etc.

  // Ejemplo simple:
  const effectElement = document.createElement('div');
  effectElement.className = 'combat-effect';
  effectElement.innerHTML = `
    <img src="${image}" alt="${name}" />
    <div class="effect-info">
      <span class="effect-name">${name}</span>
      <span class="effect-desc">${description}</span>
    </div>
  `;

  document.querySelector('.combat-effects-container').appendChild(effectElement);

  // Eliminar después de un tiempo
  setTimeout(() => {
    effectElement.classList.add('fade-out');
    setTimeout(() => effectElement.remove(), 500);
  }, 2000);
}
