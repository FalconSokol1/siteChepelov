import {
  Directive,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';

export type RevealVariant = 'up' | 'left' | 'right' | 'scale' | 'soft' | 'header';

@Directive({
  selector: '[appScrollReveal]',
  standalone: true,
})
export class ScrollRevealDirective implements OnInit, OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private observer?: IntersectionObserver;

  @Input() revealDelay = 0;
  @Input() revealVariant: RevealVariant = 'up';

  ngOnInit(): void {
    const element = this.el.nativeElement;
    element.classList.add('reveal', `reveal--${this.revealVariant}`);

    if (this.revealDelay) {
      element.style.transitionDelay = `${this.revealDelay}ms`;
    }

    const reveal = (): void => {
      element.classList.add('reveal--visible');
      this.observer?.unobserve(element);
    };

    const checkVisible = (): void => {
      const rect = element.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.94 && rect.bottom > 0) {
        reveal();
      }
    };

    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          reveal();
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -6% 0px' }
    );
    this.observer.observe(element);

    requestAnimationFrame(checkVisible);
    setTimeout(checkVisible, 120);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
