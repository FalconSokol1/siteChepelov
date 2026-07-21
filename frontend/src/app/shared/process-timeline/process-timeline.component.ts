import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  input,
  signal,
} from '@angular/core';

export interface ProcessStep {
  id: string;
  title: string;
  desc: string;
}

@Component({
  selector: 'app-process-timeline',
  standalone: true,
  templateUrl: './process-timeline.component.html',
  styleUrl: './process-timeline.component.scss',
})
export class ProcessTimelineComponent implements AfterViewInit, OnDestroy {
  readonly steps = input.required<ProcessStep[]>();
  readonly active = signal(false);

  @ViewChild('root') rootRef!: ElementRef<HTMLElement>;

  private observer?: IntersectionObserver;

  ngAfterViewInit(): void {
    const el = this.rootRef.nativeElement;
    const activate = (): void => {
      if (!this.active()) this.active.set(true);
    };

    const checkVisible = (): void => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
        activate();
      }
    };

    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          activate();
          this.observer?.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -5% 0px' }
    );
    this.observer.observe(el);

    requestAnimationFrame(checkVisible);
    setTimeout(checkVisible, 150);
    setTimeout(checkVisible, 600);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
