import {
  Component,
  forwardRef,
  signal,
  computed,
  effect,
  EventEmitter,
  Output,
  Input,
  OnDestroy,
  ElementRef,
  ViewChild,
  AfterViewInit,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { parsePhoneNumberFromString } from 'libphonenumber-js/min';

@Component({
  selector: 'app-phone-input',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PhoneInputComponent),
      multi: true,
    },
  ],
  template: `
    <div class="phone-input two-col" #root>
      <!-- Country dropdown (custom so re-select works) -->
      <div class="country-dropdown" [class.open]="dropdownOpen">
        <button
          type="button"
          class="country-select"
          aria-haspopup="listbox"
          [attr.aria-expanded]="dropdownOpen"
          (click)="toggleDropdown()"
          (keydown)="onToggleKeydown($event)"
        >
          {{ selectedLabel() }}
          <span class="chev" aria-hidden="true">▾</span>
        </button>

        <ul
          *ngIf="dropdownOpen"
          class="country-list"
          role="listbox"
          tabindex="-1"
          (keydown)="onListKeydown($event)"
        >
          <li
            *ngFor="let c of countries; let i = index"
            role="option"
            [attr.aria-selected]="c.code === selectedCountryCode()"
            class="country-option"
            (click)="selectCountry(c.code)"
            (keydown.enter)="selectCountry(c.code)"
            tabindex="0"
          >
            {{ c.label }}
          </li>
        </ul>
      </div>

      <!-- Phone input (national digits only shown to user) -->
      <input
        class="tel-input"
        type="tel"
        [attr.placeholder]="placeholder"
        [value]="combinedE164()"
        (input)="onPhoneInput($any($event.target).value)"
        aria-label="Phone number"
      />
    </div>
  `,
  styles: [
    `
      .phone-input {
        display: grid;
        gap: 1rem;
        margin-bottom: 1rem;
      }

      @media (min-width: 1024px) {
        .phone-input.two-col {
          grid-template-columns: 1fr 1fr;
        }
      }

      .country-select,
      .tel-input {
        height: auto;
        padding: 0.7rem;
        border-radius: 1.1rem;
        border: 1px solid #ccc;
        font-size: 1rem;
        background-color: #fff;
        color: #000;
        outline: none;
        transition: border-color 150ms ease;
      }

      .country-select {
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        width: 100%;
      }

      .country-select:focus,
      .tel-input:focus {
        border-color: rgba(var(--secondary-rgb), 0.6);
      }

      .country-dropdown {
        position: relative;
      }

      .country-list {
        position: absolute;
        z-index: 10;
        margin: 0;
        padding: 0.25rem 0;
        list-style: none;
        background: white;
        border: 1px solid #ccc;
        border-radius: 0.6rem;
        max-height: 220px;
        overflow: auto;
        width: 100%;
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
      }

      .country-option {
        padding: 0.6rem 0.9rem;
        cursor: pointer;
      }

      .country-option[aria-selected='true'] {
        background: rgba(var(--secondary-rgb), 0.06);
      }

      .country-option:focus {
        outline: none;
        background: rgba(var(--secondary-rgb), 0.08);
      }
    `,
  ],
})
export class PhoneInputComponent
  implements ControlValueAccessor, AfterViewInit, OnDestroy
{
  @ViewChild('root', { static: true }) rootRef!: ElementRef<HTMLElement>;

  // Optional inputs/outputs
  @Input() placeholder = '';
  @Output() countryChange = new EventEmitter<string>();
  @Output() phoneDigitsChange = new EventEmitter<string>();
  @Output() valueChange = new EventEmitter<string>(); // for convenience if parent uses (valueChange)

  // countries list — you can also provide this as @Input() if you want
  countries = [
    { code: 'SA', dialCode: '+966', label: 'Saudi Arabia (+966)' },
    { code: 'EG', dialCode: '+20', label: 'Egypt (+20)' },
    { code: 'AE', dialCode: '+971', label: 'United Arab Emirates (+971)' },
    { code: 'US', dialCode: '+1', label: 'United States (+1)' },
    { code: 'GB', dialCode: '+44', label: 'United Kingdom (+44)' },
  ];

  // --- Signals for internal state ---
  selectedCountryCode = signal<string>('SA'); // e.g. 'SA'
  phoneDigits = signal<string>(''); // NATIONAL digits only (no dial code, no +)
  dropdownOpen = false;

  // computed combined tentative E.164 (tries to parse/validate)
  combinedE164 = computed(() => {
    // if user has typed a full international number into phoneDigits (e.g. they pasted "+966..."),
    // try to parse and prefer that
    const raw = this.phoneDigits();
    const parsedFromRaw = parsePhoneNumberFromString(raw);
    const national = parsedFromRaw?.nationalNumber ?? raw.replace(/\D+/g, '');

    const country = this.countries.find(
      (c) => c.code === this.selectedCountryCode()
    );
    const dial = country?.dialCode ?? '';
    const tentative = `${dial}${national}`;

    const parsed = parsePhoneNumberFromString(tentative);
    return parsed?.isValid() ? parsed.number : tentative;
  });

  // effect: whenever combinedE164 changes, propagate to registered forms and outputs
  private lastEmittedNormalized?: string;
  private onTouched: () => void = () => {};
  private onChange: (v: string | null) => void = () => {};

  private combinedEffect = effect(() => {
    const normalized = this.combinedE164(); // reads dependencies
    if (normalized === this.lastEmittedNormalized) return;

    this.lastEmittedNormalized = normalized;
    // call ControlValueAccessor registered callback
    this.onChange(normalized);
    // convenience outputs
    this.valueChange.emit(normalized);
  });

  // constructor not needed; using signals

  // --- Life-cycle: click outside to close dropdown ---
  private clickHandler = (e: MouseEvent) => {
    if (!this.rootRef.nativeElement.contains(e.target as Node)) {
      this.dropdownOpen = false;
    }
  };

  ngAfterViewInit(): void {
    document.addEventListener('click', this.clickHandler);
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.clickHandler);
    // destroy effect (not necessary; effect auto-disposes on GC, but explicit cleanup not exposed)
  }

  // --- ControlValueAccessor implementation ---
  writeValue(obj: any): void {
    // Parent writes a combined E.164 value (or some string). Sync signals accordingly.
    const v = obj as string | undefined;
    if (!v) {
      // clear internal
      this.phoneDigits.set('');
      // optionally keep country unchanged (or reset)
      return;
    }

    const parsed = parsePhoneNumberFromString(v);
    if (parsed) {
      // set country to match if found in list
      const match = this.countries.find(
        (c) => c.dialCode === `+${parsed.countryCallingCode}`
      );
      if (match) this.selectedCountryCode.set(match.code);
      this.phoneDigits.set(parsed.nationalNumber ?? v.replace(/\D+/g, ''));
    } else {
      // fallback: treat incoming value as digits-only
      this.phoneDigits.set(v.replace(/\D+/g, ''));
    }

    // update outputs if parents rely on them
    this.countryChange.emit(this.selectedCountryCode());
    this.phoneDigitsChange.emit(this.phoneDigits());
    // also emit combined via effect automatically
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    // optional: you can add a disabled signal and bind to [disabled] on controls
  }

  // --- User interactions / helpers ---
  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }
  closeDropdown(): void {
    this.dropdownOpen = false;
  }

  selectedLabel() {
    const c = this.countries.find((x) => x.code === this.selectedCountryCode());
    return c ? c.label : 'Select country';
  }

  // Called when user selects a country (always invoked even if selecting same)
  selectCountry(code: string) {
    // set code
    this.selectedCountryCode.set(code);
    this.countryChange.emit(code);

    // If phoneDigits contains a full international number (user pasted +...), parse it and replace with nationalNumber.
    const raw = this.phoneDigits();
    const parsedFromRaw = parsePhoneNumberFromString(raw);
    if (parsedFromRaw?.nationalNumber) {
      this.phoneDigits.set(parsedFromRaw.nationalNumber);
      this.phoneDigitsChange.emit(this.phoneDigits());
    } else {
      // sanitize digits only
      this.phoneDigits.set(raw.replace(/\D+/g, ''));
      this.phoneDigitsChange.emit(this.phoneDigits());
    }

    // force update by touching the effect via updating lastEmittedNormalized guard
    this.lastEmittedNormalized = undefined;
    this.onTouched();
    this.closeDropdown();
  }

  // Called on input event for phone field
  onPhoneInput(next: string) {
    // Accept pasted +... or typed national digits. Normalize visible to digits-only if they typed digits.
    const trimmed = next ?? '';
    // If user pastes full international with +, we want to keep it so parse can handle it.
    if (trimmed.trim().startsWith('+') || trimmed.trim().startsWith('00')) {
      // keep as-is (effect parser will extract nationalNumber when building combined)
      this.phoneDigits.set(trimmed.trim());
    } else {
      // normalize to digits-only
      this.phoneDigits.set(trimmed.replace(/\D+/g, ''));
    }
    this.phoneDigitsChange.emit(this.phoneDigits());
    this.onTouched();
    // effect will run and emit combined value
  }

  // Accessibility keyboard handlers
  onToggleKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.dropdownOpen = true;
    } else if (e.key === 'Escape') {
      this.closeDropdown();
    }
  }
  onListKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      this.closeDropdown();
    }
  }

  // optional host listener to close dropdown on ESC (already handled)
  @HostListener('document:keydown.escape', ['$event'])
  onEsc(_ev: KeyboardEvent) {
    this.closeDropdown();
  }
}
