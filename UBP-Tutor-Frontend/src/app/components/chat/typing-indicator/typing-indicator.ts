import { Component } from '@angular/core';

@Component({
  selector: 'app-typing-indicator',
  standalone: true,
  template: `
    <div class="flex items-center gap-1 px-4 py-3">
      <span class="w-2 h-2 bg-slate-400 rounded-full" style="animation: bounceDot 1.4s ease-in-out infinite; animation-delay: 0s"></span>
      <span class="w-2 h-2 bg-slate-400 rounded-full" style="animation: bounceDot 1.4s ease-in-out infinite; animation-delay: 0.2s"></span>
      <span class="w-2 h-2 bg-slate-400 rounded-full" style="animation: bounceDot 1.4s ease-in-out infinite; animation-delay: 0.4s"></span>
    </div>
  `,
  styles: [`
    @keyframes bounceDot {
      0%, 80%, 100% { transform: scale(0.3); opacity: 0.3; }
      40% { transform: scale(1); opacity: 1; }
    }
  `],
})
export class TypingIndicatorComponent {}
