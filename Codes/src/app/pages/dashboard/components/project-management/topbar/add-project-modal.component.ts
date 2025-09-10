import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener,
  OnInit,
  OnDestroy,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { IdentityService } from '../../../../../core/services/identity.service';
import api from '../../../../../core/api/api';

@Component({
  selector: 'app-add-project-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './add-project-modal.component.html',
  styleUrls: ['./add-project-modal.component.scss'],
})
export class AddProjectModalComponent implements OnInit, OnDestroy {
  isSubmitting = signal(false);
  errorMessage = signal('');
  @Output() close = new EventEmitter<void>();
  @Output() refetch = new EventEmitter<void>();

  form!: FormGroup;
  dataLoaded = true;
  isAdmin = false;
  clients: Array<{ id: string; name: { en: string; ar: string } }> = [];

  constructor(private fb: FormBuilder, private identity: IdentityService) {
    this.buildForm();
  }

  async ngOnInit() {
    // lock background scroll while modal exists
    document.body.style.overflow = 'hidden';
    try {
      const who = await this.identity.getIdentity();
      this.isAdmin = !!who?.isAdmin;
      if (this.isAdmin) {
        // add clientId control for admins
        this.form.addControl(
          'clientId',
          this.fb.control('', Validators.required)
        );
        await this.loadClients();
      }
    } catch {}
  }

  ngOnDestroy() {
    document.body.style.overflow = '';
  }

  buildForm() {
    this.form = this.fb.group({
      nameAr: ['', Validators.required],
      nameEn: ['', Validators.required],
      startingDate: ['', Validators.required],
      endingDate: ['', Validators.required],
      descriptionAr: ['', Validators.required],
      descriptionEn: ['', Validators.required],
    });
  }

  private async loadClients() {
    try {
      const data: any = await api.getAllClients();
      const payload = (data as any)?.result ?? data ?? [];
      const list = Array.isArray(payload.clients) ? payload.clients : payload;
      this.clients = (list ?? []).map((c: any, idx: number) => ({
        id: c.clientId ?? c.id ?? `${idx + 1}`,
        name: c.name ?? { en: c?.company?.en ?? '', ar: c?.company?.ar ?? '' },
      }));
    } catch (e: any) {
      this.errorMessage.set(e?.message ?? 'Failed to load clients');
    }
  }

  // keyboard: close on ESC
  @HostListener('document:keydown.escape', ['$event'])
  onEscape(_: KeyboardEvent) {
    this.close.emit();
  }

  onBackdropClick() {
    this.close.emit();
  }

  async onSave(evt?: MouseEvent) {
    evt?.stopPropagation();
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    // create project
    this.isSubmitting.set(true);
    const data: any = {
      name: { en: this.form.value.nameEn, ar: this.form.value.nameAr },
      startingDate: this.form.value.startingDate,
      endingDate: this.form.value.endingDate,
      description: {
        en: this.form.value.descriptionEn,
        ar: this.form.value.descriptionAr,
      },
    };

    try {
      if (this.isAdmin) {
        data.clientId = this.form.value.clientId;
        await api.adminCreateProject(data);
      } else {
        await api.createProject(data);
      }
      // Success case - emit refetch and close
      this.refetch.emit();
      this.close.emit();
    } catch (error: any) {
      this.errorMessage.set(
        error.message || 'An error occurred while creating project'
      );
    } finally {
      this.isSubmitting.set(false);
    }
  }

  onClose(evt?: MouseEvent) {
    evt?.stopPropagation();
    this.close.emit();
  }
}
