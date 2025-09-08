import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ManualNavbarComponent } from '../../components/manual-navbar/manual-navbar.component';
import { ComboSelectorComponent } from '../../components/shared/combo-selector/combo-selector.component';
import jsQR from 'jsqr';
import api from '../../core/api/api';

type AttendanceRecord = {
  userId: string;
  areaId: string;
  signedWith: 'BARCODE' | 'MANUAL';
};

@Component({
  selector: 'app-take-attendance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    ManualNavbarComponent,
    ComboSelectorComponent,
  ],
  template: `
    <app-manual-navbar />
    <div class="take-attendance-container">
      <div class="header-section">
        <h1>
          {{ 'ATTENDANCE.TITLE' | translate : { default: 'Take Attendance' } }}
        </h1>
      </div>

      <div class="content-section">
        <!-- Zone Selection -->
        <div class="zone-selection">
          <h3>
            {{
              'ATTENDANCE.SELECT_ZONE' | translate : { default: 'Select Zone' }
            }}
          </h3>
          <app-combo-selector
            [projects]="zonesForSelector"
            [selectedValue]="selectedZoneId"
            placeholder="{{
              'ATTENDANCE.CHOOSE_ZONE'
                | translate : { default: 'Choose a zone...' }
            }}"
            (projectSelected)="onZoneSelected($event)"
          >
          </app-combo-selector>
        </div>

        <!-- Main Attendance UI (shown after zone selection) -->
        <div *ngIf="selectedZoneId">
          <div class="attendance-grid">
            <div class="attendance-card">
              <h3>
                {{
                  'ATTENDANCE.ADD_MANUAL'
                    | translate : { default: 'Add Attendance (Manual)' }
                }}
              </h3>
              <form (ngSubmit)="addAttendance()">
                <input
                  type="text"
                  placeholder="User ID"
                  [(ngModel)]="userId"
                  name="userId"
                  required
                />
                <button type="submit">
                  {{ 'ATTENDANCE.ADD' | translate : { default: 'Add' } }}
                </button>
              </form>
            </div>

            <div class="attendance-card">
              <h3>
                {{
                  'ATTENDANCE.QR' | translate : { default: 'Scan QR to Add' }
                }}
              </h3>
              <p class="muted">
                {{
                  'ATTENDANCE.QR_DESC'
                    | translate
                      : {
                          default:
                            'Use your camera to scan a QR that contains userId'
                        }
                }}
              </p>

              <!-- Video preview for the camera -->
              <div class="qr-scanner">
                <video #video autoplay playsinline></video>
                <!-- hidden canvas used to capture frames for decoding -->
                <canvas #canvas hidden></canvas>
              </div>

              <div class="scanner-controls">
                <button (click)="startScanner()" [disabled]="scannerActive">
                  {{
                    'ATTENDANCE.START_SCAN'
                      | translate : { default: 'Start Scanner' }
                  }}
                </button>
                <button (click)="stopScanner()" [disabled]="!scannerActive">
                  {{
                    'ATTENDANCE.STOP_SCAN'
                      | translate : { default: 'Stop Scanner' }
                  }}
                </button>
              </div>

              <div *ngIf="lastScanned" class="scanned-result">
                <strong>Scanned:</strong> {{ lastScanned }}
              </div>
            </div>

            <div class="attendance-card full-width">
              <h3>
                {{
                  'ATTENDANCE.LIST'
                    | translate : { default: 'Recent Attendance' }
                }}
              </h3>
              <div *ngIf="records.length === 0" class="no-records">
                <p>
                  {{
                    'ATTENDANCE.NO_RECORDS'
                      | translate : { default: 'No attendance records yet' }
                  }}
                </p>
              </div>
              <ul class="records-list" *ngIf="records.length > 0">
                <li class="record-item" *ngFor="let r of records">
                  <div class="record-name">
                    {{ r.userId }}
                  </div>
                  <div class="record-time">Method: {{ r.signedWith }}</div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .take-attendance-container {
        margin: 0 auto;
        margin-top: 2rem;
        padding: 2rem;
        max-width: 1200px;
      }

      .zone-selection {
        margin-bottom: 2rem;
        padding: 2rem;
        background: var(--bg-dark);
        border-radius: var(--radius-card);
        border: 1px solid var(--color-text);

        h3 {
          margin: 0 0 1.5rem 0;
          color: var(--white);
          font-size: 1.25rem;
        }
      }

      .header-section {
        text-align: center;
        margin-bottom: 2rem;

        h1 {
          font-size: 2.5rem;
          margin: 0 0 0.5rem 0;
          color: var(--color-font-primary);
        }
      }

      .content-section {
        margin-bottom: 2rem;
      }

      .attendance-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
      }

      .attendance-card {
        padding: 1.5rem;
        background: var(--bg-dark);
        border-radius: var(--radius-card);
        box-shadow: 0 6px 0 rgba(var(--bg-dark-rgb), 0.25) inset;

        h3 {
          font-size: 1.25rem;
          margin: 0 0 1rem 0;
          color: var(--white);
        }

        form {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-bottom: 1rem;
        }

        input {
          border: 1px solid var(--color-text);
          border-radius: 0.375rem;
          padding: 0.5rem 0.75rem;
          flex: 1;
          min-width: 120px;
        }

        button {
          background: var(--btn-color);
          color: #fff;
          border: 0;
          border-radius: 0.375rem;
          padding: 0.5rem 0.75rem;
          cursor: pointer;
          transition: background-color 0.2s;

          &:hover {
            background: var(--btn-color-hover);
          }
        }

        .muted {
          color: var(--color-font-secondary);
          margin-bottom: 1rem;
        }

        .records-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .record-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid var(--color-text);

          &:last-child {
            border-bottom: 0;
          }
        }

        .record-name {
          font-weight: 600;
          color: var(--color-font-primary);
        }

        .record-time {
          color: var(--color-font-secondary);
          font-size: 0.875rem;
        }

        .no-records {
          text-align: center;
          padding: 2rem;

          p {
            color: var(--color-font-secondary);
            margin: 0;
          }
        }

        .qr-scanner {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        video {
          width: 100%;
          max-height: 320px;
          border-radius: 0.5rem;
          background: var(--color-text);
        }

        .scanner-controls {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .scanned-result {
          margin-top: 0.5rem;
          color: var(--color-font-secondary);
        }
      }

      .full-width {
        grid-column: 1 / -1;
      }

      @media (max-width: 768px) {
        .take-attendance-container {
          padding: 1rem;
        }

        .header-section {
          margin-bottom: 1.5rem;

          h1 {
            font-size: 2rem;
          }
        }

        .zone-selection {
          padding: 1rem;
        }

        .attendance-grid {
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        .attendance-card form {
          flex-direction: column;

          input {
            min-width: auto;
          }
        }
      }
    `,
  ],
})
export class TakeAttendanceComponent implements AfterViewInit, OnDestroy {
  records: AttendanceRecord[] = [];
  userId = '';
  private _zones: any[] = [];
  private _loading = false;

  // Zone selection
  selectedZoneId: string | undefined = undefined;

  get zonesForSelector() {
    return this._zones.map((zone) => ({
      id: zone.areaId || zone.id,
      name: {
        en: zone.name?.en || zone.name || 'Zone',
        ar: zone.name?.ar || zone.name || 'Zone',
      },
    }));
  }

  @ViewChild('video', { static: false })
  videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas', { static: false })
  canvasRef!: ElementRef<HTMLCanvasElement>;

  scannerActive = false;
  private animationFrameId = 0;
  private mediaStream: MediaStream | null = null;
  lastScanned = '';

  async ngOnInit(): Promise<void> {
    try {
      this._loading = true;
      // Load all areas/zones from API
      const data: any = await api.getAllAreas();
      const payload = (data as any)?.result ?? data ?? {};
      this._zones = Array.isArray(payload.areas) ? payload.areas : [];
    } catch (error) {
      console.error('Error loading zones:', error);
      this._zones = [];
    } finally {
      this._loading = false;
    }
  }

  ngAfterViewInit(): void {
    // nothing automatic — user must press start to allow camera permissions
  }

  onZoneSelected(zoneId: string | null) {
    this.selectedZoneId = zoneId || undefined;
  }

  ngOnDestroy(): void {
    this.stopScanner();
  }

  async addAttendance(signedWith: 'BARCODE' | 'MANUAL' = 'MANUAL') {
    if (!this.userId || !this.selectedZoneId) return;

    try {
      const result = await api.createAttendance({
        userId: this.userId,
        areaId: this.selectedZoneId,
        signedWith,
      });

      if ((result as any).success) {
        // Add to local records for display
        this.records = [
          {
            userId: this.userId,
            areaId: this.selectedZoneId,
            signedWith,
          },
          ...this.records,
        ];
        this.userId = '';
      } else {
        console.error('Error recording attendance:', (result as any).error);
      }
    } catch (error) {
      console.error('Error recording attendance:', error);
    }
  }

  async startScanner() {
    if (this.scannerActive) return;
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });

      const video = this.videoRef.nativeElement;
      video.srcObject = this.mediaStream;
      await video.play();

      this.scannerActive = true;
      this.scanFrame();
    } catch (err) {
      console.error('Camera permission denied or not available', err);
      this.scannerActive = false;
    }
  }

  stopScanner() {
    this.scannerActive = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = 0;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }
  }

  private scanFrame() {
    const video = this.videoRef?.nativeElement;
    const canvas = this.canvasRef?.nativeElement;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = video.videoWidth;
    const height = video.videoHeight;

    if (width === 0 || height === 0) {
      // video not ready yet — try again
      this.animationFrameId = requestAnimationFrame(() => this.scanFrame());
      return;
    }

    // size canvas to video
    canvas.width = width;
    canvas.height = height;

    // draw current video frame to canvas
    ctx.drawImage(video, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);

    try {
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code && code.data) {
        // set last scanned text
        this.lastScanned = code.data;

        // If QR contains JSON with userId and optional userName, parse it.
        // Otherwise treat entire payload as userId string.
        try {
          const parsed = JSON.parse(code.data);
          if (parsed && parsed.userId) {
            this.userId = String(parsed.userId);

            this.addAttendance('BARCODE');
          } else {
            // not JSON or doesn't have userId — use raw text as userId
            this.userId = code.data;
            this.addAttendance('BARCODE');
          }
        } catch (e) {
          // not JSON — raw string
          this.userId = code.data;
          this.addAttendance('BARCODE');
        }

        // stop after a successful scan (optional). Remove this line to keep scanning.
        this.stopScanner();
        return;
      }
    } catch (err) {
      // jsQR might throw on malformed inputs — ignore and continue
      console.warn('Error decoding QR', err);
    }

    // schedule next frame
    this.animationFrameId = requestAnimationFrame(() => this.scanFrame());
  }
}
