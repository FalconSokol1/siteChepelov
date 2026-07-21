import {
  Directive,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';

@Directive({
  selector: '[appCounter]',
  standalone: true,
})
export class CounterDirective implements OnInit, OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private observer?: IntersectionObserver;
  private animated = false;

  @Input('appCounter') target = 0;
  @Input() counterSuffix = '';
  @Input() counterDuration = 2000;

  ngOnInit(): void {
    this.el.nativeElement.textContent = '0' + this.counterSuffix;

    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !this.animated) {
          this.animated = true;
          this.animate();
          this.observer?.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private animate(): void {
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / this.counterDuration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.floor(this.target * eased);
      this.el.nativeElement.textContent = value.toLocaleString('ru-RU') + this.counterSuffix;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
}
