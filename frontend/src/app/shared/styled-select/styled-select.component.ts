import {
  Component,
  ElementRef,
  HostListener,
  Input,
  forwardRef,
  inject,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-styled-select',
  standalone: true,
  templateUrl: './styled-select.component.html',
  styleUrl: './styled-select.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => StyledSelectComponent),
      multi: true,
    },
  ],
})
export class StyledSelectComponent implements ControlValueAccessor {
  private readonly host = inject(ElementRef<HTMLElement>);

  @Input() label = '';
  @Input() placeholder = 'Выберите';
  @Input() options: SelectOption[] = [];
  @Input() id = '';

  readonly open = signal(false);
  readonly disabled = signal(false);
  private value = '';
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  selectedLabel(): string {
    return this.options.find((option) => option.value === this.value)?.label ?? this.placeholder;
  }

  toggle(): void {
    if (this.disabled()) return;
    this.open.update((isOpen) => !isOpen);
    if (this.open()) {
      this.onTouched();
    }
  }

  pick(option: SelectOption): void {
    this.value = option.value;
    this.onChange(option.value);
    this.open.set(false);
    this.onTouched();
  }

  isSelected(option: SelectOption): boolean {
    return this.value === option.value;
  }

  writeValue(value: string | null): void {
    this.value = value ?? '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.open.set(false);
  }
}
