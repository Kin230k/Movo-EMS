import { Component, ViewChildren, QueryList, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ThemedButtonComponent } from '../../../components/shared/themed-button/themed-button';

@Component({
  selector: 'app-two-fa',
  standalone: true,
  imports: [CommonModule, FormsModule, ThemedButtonComponent, TranslateModule],
  templateUrl: './app-two-f-a.component.html',
  styleUrls: ['./app-two-f-a.component.scss']
})
export class TwoFAComponent implements AfterViewInit {
  @ViewChildren('codeInput') codeInputs!: QueryList<ElementRef>;

  code: string[] = Array(6).fill('');
  phoneNumber: string = '';
  errorMessage: string = '';
  showError: boolean = false;
  isSubmitting: boolean = false;

  constructor(private router: Router) {}

  ngAfterViewInit(): void {
    // التركيز على الحقل الأول بعد تحميل العرض
    setTimeout(() => {
      const firstInput = this.codeInputs.toArray()[0]?.nativeElement;
      if (firstInput) firstInput.focus();
    }, 100);
  }

  onInputChange(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // السماح بالأرقام فقط
    if (!/^\d*$/.test(value)) {
      value = value.replace(/[^\d]/g, '');
    }

    // نخزن رقم واحد فقط
    this.code[index] = value.slice(-1);

    // تحديث قيمة الحقل (عشان لو المستخدم لصق أكثر من رقم)
    input.value = this.code[index];

    // إذا تم إدخال رقم، الانتقال للحقل التالي
    if (value.length === 1 && index < 5) {
      this.focusNextInput(index);
    }

    // إذا تم مسح الحقل، الانتقال للحقل السابق
    if (value.length === 0 && index > 0) {
      this.focusPrevInput(index);
    }

    this.hideError();
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    const input = event.target as HTMLInputElement;

    switch (event.key) {
      case 'Backspace':
        if (input.value === '' && index > 0) {
          event.preventDefault();
          this.focusPrevInput(index);
        }
        break;

      case 'ArrowLeft':
        if (index > 0) {
          event.preventDefault();
          this.focusPrevInput(index);
        }
        break;

      case 'ArrowRight':
        if (index < 5) {
          event.preventDefault();
          this.focusNextInput(index);
        }
        break;

      case 'Delete':
        event.preventDefault();
        input.value = '';
        this.code[index] = '';
        break;

      default:
        // السماح فقط بالأرقام ومفاتيح التحكم
        if (!/^\d$/.test(event.key) &&
            !['Tab', 'Enter', 'Shift', 'Control', 'Alt', 'Meta'].includes(event.key)) {
          event.preventDefault();
        }
        break;
    }
  }

  onPaste(event: ClipboardEvent, index: number): void {
    event.preventDefault();
    const pastedText = event.clipboardData?.getData('text') || '';

    if (/^\d+$/.test(pastedText)) {
      const digits = pastedText.split('').slice(0, 6);

      digits.forEach((digit, i) => {
        const currentIndex = index + i;
        if (currentIndex < 6) {
          this.code[currentIndex] = digit;
        }
      });

      // تحديث قيم المدخلات في العرض
      this.updateInputValues();

      // التركيز على الحقل الأخير المملوء أو التالي
      const nextFocusIndex = Math.min(index + digits.length, 5);
      this.focusInput(nextFocusIndex);

      this.hideError();
    }
  }

  onInputFocus(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    input.select();
  }

  onSubmit(): void {
    if (this.isSubmitting) return;

    this.isSubmitting = true;
    const verificationCode = this.code.join('');

    if (!this.validateForm()) {
      this.isSubmitting = false;
      return;
    }

    console.log('Phone number:', this.phoneNumber);
    console.log('Verification code:', verificationCode);

    // محاكاة عملية التحقق
    setTimeout(() => {
      this.isSubmitting = false;
      this.router.navigate(['/dashboard']);
    }, 1000);
  }

  onCancel(): void {
    this.router.navigate(['/login']);
  }

  resendCode(): void {
    if (!this.phoneNumber) {
      this.showErrorMessage('يرجى إدخال رقم الهاتف أولاً');
      return;
    }

    console.log('Resending verification code to:', this.phoneNumber);
    this.clearCode();

    this.errorMessage = 'تم إعادة إرسال الرمز بنجاح';
    this.showError = false;

    setTimeout(() => {
      this.hideError();
    }, 3000);
  }

  useAlternativeMethod(): void {
    console.log('Using alternative verification method');
  }

  private validateForm(): boolean {
    if (!this.phoneNumber.trim()) {
      this.showErrorMessage('يرجى إدخال رقم الهاتف');
      return false;
    }

    if (this.code.join('').length !== 6) {
      this.showErrorMessage('يرجى إدخال رمز التحقق المكون من 6 أرقام');
      return false;
    }

    return true;
  }

  private focusNextInput(currentIndex: number): void {
    setTimeout(() => {
      const nextInput = this.codeInputs.toArray()[currentIndex + 1]?.nativeElement;
      if (nextInput) {
        nextInput.focus();
        nextInput.select();
      }
    }, 10);
  }

  private focusPrevInput(currentIndex: number): void {
    setTimeout(() => {
      const prevInput = this.codeInputs.toArray()[currentIndex - 1]?.nativeElement;
      if (prevInput) {
        prevInput.focus();
        prevInput.select();
      }
    }, 10);
  }

  private focusInput(index: number): void {
    setTimeout(() => {
      const input = this.codeInputs.toArray()[index]?.nativeElement;
      if (input) {
        input.focus();
        input.select();
      }
    }, 10);
  }

  private updateInputValues(): void {
    this.codeInputs.forEach((input, index) => {
      input.nativeElement.value = this.code[index];
    });
  }

  private clearCode(): void {
    this.code = Array(6).fill('');
    this.updateInputValues();
    this.focusInput(0);
  }

  private showErrorMessage(message: string): void {
    this.errorMessage = message;
    this.showError = true;
    this.shakeInputs();
  }

  private hideError(): void {
    this.errorMessage = '';
    this.showError = false;
  }

  private shakeInputs(): void {
    this.codeInputs.forEach(input => {
      input.nativeElement.classList.add('shake');
      setTimeout(() => {
        input.nativeElement.classList.remove('shake');
      }, 500);
    });
  }
}
