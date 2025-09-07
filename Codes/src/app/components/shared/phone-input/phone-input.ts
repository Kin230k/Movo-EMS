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
        color: #000;
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
    { code: 'AF', dialCode: '+93', label: 'Afghanistan (+93)' },
    { code: 'AL', dialCode: '+355', label: 'Albania (+355)' },
    { code: 'DZ', dialCode: '+213', label: 'Algeria (+213)' },
    { code: 'AS', dialCode: '+1-684', label: 'American Samoa (+1-684)' },
    { code: 'AD', dialCode: '+376', label: 'Andorra (+376)' },
    { code: 'AO', dialCode: '+244', label: 'Angola (+244)' },
    { code: 'AI', dialCode: '+1-264', label: 'Anguilla (+1-264)' },
    { code: 'AG', dialCode: '+1-268', label: 'Antigua and Barbuda (+1-268)' },
    { code: 'AR', dialCode: '+54', label: 'Argentina (+54)' },
    { code: 'AM', dialCode: '+374', label: 'Armenia (+374)' },
    { code: 'AW', dialCode: '+297', label: 'Aruba (+297)' },
    { code: 'AU', dialCode: '+61', label: 'Australia (+61)' },
    { code: 'AT', dialCode: '+43', label: 'Austria (+43)' },
    { code: 'AZ', dialCode: '+994', label: 'Azerbaijan (+994)' },
    { code: 'BS', dialCode: '+1-242', label: 'Bahamas (+1-242)' },
    { code: 'BH', dialCode: '+973', label: 'Bahrain (+973)' },
    { code: 'BD', dialCode: '+880', label: 'Bangladesh (+880)' },
    { code: 'BB', dialCode: '+1-246', label: 'Barbados (+1-246)' },
    { code: 'BY', dialCode: '+375', label: 'Belarus (+375)' },
    { code: 'BE', dialCode: '+32', label: 'Belgium (+32)' },
    { code: 'BZ', dialCode: '+501', label: 'Belize (+501)' },
    { code: 'BJ', dialCode: '+229', label: 'Benin (+229)' },
    { code: 'BM', dialCode: '+1-441', label: 'Bermuda (+1-441)' },
    { code: 'BT', dialCode: '+975', label: 'Bhutan (+975)' },
    { code: 'BO', dialCode: '+591', label: 'Bolivia (+591)' },
    { code: 'BA', dialCode: '+387', label: 'Bosnia and Herzegovina (+387)' },
    { code: 'BW', dialCode: '+267', label: 'Botswana (+267)' },
    { code: 'BR', dialCode: '+55', label: 'Brazil (+55)' },
    {
      code: 'IO',
      dialCode: '+246',
      label: 'British Indian Ocean Territory (+246)',
    },
    {
      code: 'VG',
      dialCode: '+1-284',
      label: 'British Virgin Islands (+1-284)',
    },
    { code: 'BN', dialCode: '+673', label: 'Brunei (+673)' },
    { code: 'BG', dialCode: '+359', label: 'Bulgaria (+359)' },
    { code: 'BF', dialCode: '+226', label: 'Burkina Faso (+226)' },
    { code: 'BI', dialCode: '+257', label: 'Burundi (+257)' },
    { code: 'KH', dialCode: '+855', label: 'Cambodia (+855)' },
    { code: 'CM', dialCode: '+237', label: 'Cameroon (+237)' },
    { code: 'CA', dialCode: '+1', label: 'Canada (+1)' },
    { code: 'CV', dialCode: '+238', label: 'Cape Verde / Cabo Verde (+238)' },
    { code: 'KY', dialCode: '+1-345', label: 'Cayman Islands (+1-345)' },
    { code: 'CF', dialCode: '+236', label: 'Central African Republic (+236)' },
    { code: 'TD', dialCode: '+235', label: 'Chad (+235)' },
    { code: 'CL', dialCode: '+56', label: 'Chile (+56)' },
    { code: 'CN', dialCode: '+86', label: 'China (+86)' },
    { code: 'CX', dialCode: '+61', label: 'Christmas Island (+61)' },
    { code: 'CC', dialCode: '+61', label: 'Cocos (Keeling) Islands (+61)' },
    { code: 'CO', dialCode: '+57', label: 'Colombia (+57)' },
    { code: 'KM', dialCode: '+269', label: 'Comoros (+269)' },
    { code: 'CK', dialCode: '+682', label: 'Cook Islands (+682)' },
    { code: 'CR', dialCode: '+506', label: 'Costa Rica (+506)' },
    { code: 'CI', dialCode: '+225', label: 'Côte d’Ivoire (+225)' },
    { code: 'HR', dialCode: '+385', label: 'Croatia (+385)' },
    { code: 'CU', dialCode: '+53', label: 'Cuba (+53)' },
    { code: 'CW', dialCode: '+599', label: 'Curaçao (+599)' },
    { code: 'CY', dialCode: '+357', label: 'Cyprus (+357)' },
    { code: 'CZ', dialCode: '+420', label: 'Czech Republic (+420)' },
    {
      code: 'CD',
      dialCode: '+243',
      label: 'Democratic Republic of the Congo (+243)',
    },
    { code: 'DK', dialCode: '+45', label: 'Denmark (+45)' },
    { code: 'DJ', dialCode: '+253', label: 'Djibouti (+253)' },
    { code: 'DM', dialCode: '+1-767', label: 'Dominica (+1-767)' },
    {
      code: 'DO',
      dialCode: '+1-809',
      label: 'Dominican Republic (+1-809/1-829/1-849)',
    },
    { code: 'EC', dialCode: '+593', label: 'Ecuador (+593)' },
    { code: 'EG', dialCode: '+20', label: 'Egypt (+20)' },
    { code: 'SV', dialCode: '+503', label: 'El Salvador (+503)' },
    { code: 'GQ', dialCode: '+240', label: 'Equatorial Guinea (+240)' },
    { code: 'ER', dialCode: '+291', label: 'Eritrea (+291)' },
    { code: 'EE', dialCode: '+372', label: 'Estonia (+372)' },
    { code: 'SZ', dialCode: '+268', label: 'Eswatini (+268)' },
    { code: 'ET', dialCode: '+251', label: 'Ethiopia (+251)' },
    { code: 'FK', dialCode: '+500', label: 'Falkland Islands (+500)' },
    { code: 'FO', dialCode: '+298', label: 'Faroe Islands (+298)' },
    { code: 'FJ', dialCode: '+679', label: 'Fiji (+679)' },
    { code: 'FI', dialCode: '+358', label: 'Finland (+358)' },
    { code: 'FR', dialCode: '+33', label: 'France (+33)' },
    { code: 'PF', dialCode: '+689', label: 'French Polynesia (+689)' },
    { code: 'GA', dialCode: '+241', label: 'Gabon (+241)' },
    { code: 'GM', dialCode: '+220', label: 'Gambia (+220)' },
    { code: 'GE', dialCode: '+995', label: 'Georgia (+995)' },
    { code: 'DE', dialCode: '+49', label: 'Germany (+49)' },
    { code: 'GH', dialCode: '+233', label: 'Ghana (+233)' },
    { code: 'GI', dialCode: '+350', label: 'Gibraltar (+350)' },
    { code: 'GR', dialCode: '+30', label: 'Greece (+30)' },
    { code: 'GL', dialCode: '+299', label: 'Greenland (+299)' },
    { code: 'GD', dialCode: '+1-473', label: 'Grenada (+1-473)' },
    { code: 'GU', dialCode: '+1-671', label: 'Guam (+1-671)' },
    { code: 'GT', dialCode: '+502', label: 'Guatemala (+502)' },
    { code: 'GG', dialCode: '+44-1481', label: 'Guernsey (+44-1481)' },
    { code: 'GN', dialCode: '+224', label: 'Guinea (+224)' },
    { code: 'GW', dialCode: '+245', label: 'Guinea-Bissau (+245)' },
    { code: 'GY', dialCode: '+592', label: 'Guyana (+592)' },
    { code: 'HT', dialCode: '+509', label: 'Haiti (+509)' },
    { code: 'HN', dialCode: '+504', label: 'Honduras (+504)' },
    { code: 'HK', dialCode: '+852', label: 'Hong Kong (+852)' },
    { code: 'HU', dialCode: '+36', label: 'Hungary (+36)' },
    { code: 'IS', dialCode: '+354', label: 'Iceland (+354)' },
    { code: 'IN', dialCode: '+91', label: 'India (+91)' },
    { code: 'ID', dialCode: '+62', label: 'Indonesia (+62)' },
    { code: 'IR', dialCode: '+98', label: 'Iran (+98)' },
    { code: 'IQ', dialCode: '+964', label: 'Iraq (+964)' },
    { code: 'IE', dialCode: '+353', label: 'Ireland (+353)' },
    { code: 'IM', dialCode: '+44-1624', label: 'Isle of Man (+44-1624)' },
    { code: 'IL', dialCode: '+972', label: 'Israel (+972)' },
    { code: 'IT', dialCode: '+39', label: 'Italy (+39)' },
    { code: 'JM', dialCode: '+1-876', label: 'Jamaica (+1-876)' },
    { code: 'JP', dialCode: '+81', label: 'Japan (+81)' },
    { code: 'JE', dialCode: '+44-1534', label: 'Jersey (+44-1534)' },
    { code: 'JO', dialCode: '+962', label: 'Jordan (+962)' },
    { code: 'KZ', dialCode: '+7', label: 'Kazakhstan (+7)' },
    { code: 'KE', dialCode: '+254', label: 'Kenya (+254)' },
    { code: 'KI', dialCode: '+686', label: 'Kiribati (+686)' },
    { code: 'KP', dialCode: '+850', label: 'North Korea (+850)' },
    { code: 'KR', dialCode: '+82', label: 'South Korea (+82)' },
    { code: 'XK', dialCode: '+383', label: 'Kosovo (+383)' },
    { code: 'KW', dialCode: '+965', label: 'Kuwait (+965)' },
    { code: 'KG', dialCode: '+996', label: 'Kyrgyzstan (+996)' },
    { code: 'LA', dialCode: '+856', label: 'Laos (+856)' },
    { code: 'LV', dialCode: '+371', label: 'Latvia (+371)' },
    { code: 'LB', dialCode: '+961', label: 'Lebanon (+961)' },
    { code: 'LS', dialCode: '+266', label: 'Lesotho (+266)' },
    { code: 'LR', dialCode: '+231', label: 'Liberia (+231)' },
    { code: 'LY', dialCode: '+218', label: 'Libya (+218)' },
    { code: 'LI', dialCode: '+423', label: 'Liechtenstein (+423)' },
    { code: 'LT', dialCode: '+370', label: 'Lithuania (+370)' },
    { code: 'LU', dialCode: '+352', label: 'Luxembourg (+352)' },
    { code: 'MO', dialCode: '+853', label: 'Macau (+853)' },
    { code: 'MG', dialCode: '+261', label: 'Madagascar (+261)' },
    { code: 'MW', dialCode: '+265', label: 'Malawi (+265)' },
    { code: 'MY', dialCode: '+60', label: 'Malaysia (+60)' },
    { code: 'MV', dialCode: '+960', label: 'Maldives (+960)' },
    { code: 'ML', dialCode: '+223', label: 'Mali (+223)' },
    { code: 'MT', dialCode: '+356', label: 'Malta (+356)' },
    { code: 'MH', dialCode: '+692', label: 'Marshall Islands (+692)' },
    { code: 'MQ', dialCode: '+596', label: 'Martinique (+596)' },
    { code: 'MR', dialCode: '+222', label: 'Mauritania (+222)' },
    { code: 'MU', dialCode: '+230', label: 'Mauritius (+230)' },
    { code: 'YT', dialCode: '+262', label: 'Mayotte (+262)' },
    { code: 'MX', dialCode: '+52', label: 'Mexico (+52)' },
    { code: 'FM', dialCode: '+691', label: 'Micronesia (+691)' },
    { code: 'MD', dialCode: '+373', label: 'Moldova (+373)' },
    { code: 'MC', dialCode: '+377', label: 'Monaco (+377)' },
    { code: 'MN', dialCode: '+976', label: 'Mongolia (+976)' },
    { code: 'ME', dialCode: '+382', label: 'Montenegro (+382)' },
    { code: 'MS', dialCode: '+1-664', label: 'Montserrat (+1-664)' },
    { code: 'MA', dialCode: '+212', label: 'Morocco (+212)' },
    { code: 'MZ', dialCode: '+258', label: 'Mozambique (+258)' },
    { code: 'MM', dialCode: '+95', label: 'Myanmar (+95)' },
    { code: 'NA', dialCode: '+264', label: 'Namibia (+264)' },
    { code: 'NR', dialCode: '+674', label: 'Nauru (+674)' },
    { code: 'NP', dialCode: '+977', label: 'Nepal (+977)' },
    { code: 'NL', dialCode: '+31', label: 'Netherlands (+31)' },
    { code: 'NC', dialCode: '+687', label: 'New Caledonia (+687)' },
    { code: 'NZ', dialCode: '+64', label: 'New Zealand (+64)' },
    { code: 'NI', dialCode: '+505', label: 'Nicaragua (+505)' },
    { code: 'NE', dialCode: '+227', label: 'Niger (+227)' },
    { code: 'NG', dialCode: '+234', label: 'Nigeria (+234)' },
    { code: 'NU', dialCode: '+683', label: 'Niue (+683)' },
    { code: 'NF', dialCode: '+672', label: 'Norfolk Island (+672)' },
    {
      code: 'MP',
      dialCode: '+1-670',
      label: 'Northern Mariana Islands (+1-670)',
    },
    { code: 'NO', dialCode: '+47', label: 'Norway (+47)' },
    { code: 'OM', dialCode: '+968', label: 'Oman (+968)' },
    { code: 'PK', dialCode: '+92', label: 'Pakistan (+92)' },
    { code: 'PW', dialCode: '+680', label: 'Palau (+680)' },
    { code: 'PS', dialCode: '+970', label: 'Palestine (+970)' },
    { code: 'PA', dialCode: '+507', label: 'Panama (+507)' },
    { code: 'PG', dialCode: '+675', label: 'Papua New Guinea (+675)' },
    { code: 'PY', dialCode: '+595', label: 'Paraguay (+595)' },
    { code: 'PE', dialCode: '+51', label: 'Peru (+51)' },
    { code: 'PH', dialCode: '+63', label: 'Philippines (+63)' },
    { code: 'PN', dialCode: '+870', label: 'Pitcairn (+870)' },
    { code: 'PL', dialCode: '+48', label: 'Poland (+48)' },
    { code: 'PT', dialCode: '+351', label: 'Portugal (+351)' },
    { code: 'PR', dialCode: '+1-787', label: 'Puerto Rico (+1-787/1-939)' },
    { code: 'QA', dialCode: '+974', label: 'Qatar (+974)' },
    { code: 'RE', dialCode: '+262', label: 'Réunion (+262)' },
    { code: 'RO', dialCode: '+40', label: 'Romania (+40)' },
    { code: 'RU', dialCode: '+7', label: 'Russia (+7)' },
    { code: 'RW', dialCode: '+250', label: 'Rwanda (+250)' },
    { code: 'BL', dialCode: '+590', label: 'Saint Barthélemy (+590)' },
    { code: 'KN', dialCode: '+1-869', label: 'Saint Kitts and Nevis (+1-869)' },
    { code: 'LC', dialCode: '+1-758', label: 'Saint Lucia (+1-758)' },
    { code: 'MF', dialCode: '+590', label: 'Saint Martin (French) (+590)' },
    { code: 'PM', dialCode: '+508', label: 'Saint Pierre and Miquelon (+508)' },
    {
      code: 'VC',
      dialCode: '+1-784',
      label: 'Saint Vincent and the Grenadines (+1-784)',
    },
    { code: 'WS', dialCode: '+685', label: 'Samoa (+685)' },
    { code: 'SM', dialCode: '+378', label: 'San Marino (+378)' },
    { code: 'ST', dialCode: '+239', label: 'Sao Tome and Principe (+239)' },
    { code: 'SA', dialCode: '+966', label: 'Saudi Arabia (+966)' },
    { code: 'SN', dialCode: '+221', label: 'Senegal (+221)' },
    { code: 'RS', dialCode: '+381', label: 'Serbia (+381)' },
    { code: 'SC', dialCode: '+248', label: 'Seychelles (+248)' },
    { code: 'SL', dialCode: '+232', label: 'Sierra Leone (+232)' },
    { code: 'SG', dialCode: '+65', label: 'Singapore (+65)' },
    { code: 'SX', dialCode: '+1-721', label: 'Sint Maarten (+1-721)' },
    { code: 'SK', dialCode: '+421', label: 'Slovakia (+421)' },
    { code: 'SI', dialCode: '+386', label: 'Slovenia (+386)' },
    { code: 'SB', dialCode: '+677', label: 'Solomon Islands (+677)' },
    { code: 'SO', dialCode: '+252', label: 'Somalia (+252)' },
    { code: 'ZA', dialCode: '+27', label: 'South Africa (+27)' },
    { code: 'SS', dialCode: '+211', label: 'South Sudan (+211)' },
    { code: 'ES', dialCode: '+34', label: 'Spain (+34)' },
    { code: 'LK', dialCode: '+94', label: 'Sri Lanka (+94)' },
    { code: 'SD', dialCode: '+249', label: 'Sudan (+249)' },
    { code: 'SR', dialCode: '+597', label: 'Suriname (+597)' },
    { code: 'SE', dialCode: '+46', label: 'Sweden (+46)' },
    { code: 'CH', dialCode: '+41', label: 'Switzerland (+41)' },
    { code: 'SY', dialCode: '+963', label: 'Syria (+963)' },
    { code: 'TW', dialCode: '+886', label: 'Taiwan (+886)' },
    { code: 'TJ', dialCode: '+992', label: 'Tajikistan (+992)' },
    { code: 'TZ', dialCode: '+255', label: 'Tanzania (+255)' },
    { code: 'TH', dialCode: '+66', label: 'Thailand (+66)' },
    { code: 'TL', dialCode: '+670', label: 'Timor-Leste (+670)' },
    { code: 'TG', dialCode: '+228', label: 'Togo (+228)' },
    { code: 'TK', dialCode: '+690', label: 'Tokelau (+690)' },
    { code: 'TO', dialCode: '+676', label: 'Tonga (+676)' },
    { code: 'TT', dialCode: '+1-868', label: 'Trinidad and Tobago (+1-868)' },
    { code: 'TN', dialCode: '+216', label: 'Tunisia (+216)' },
    { code: 'TR', dialCode: '+90', label: 'Turkey (+90)' },
    { code: 'TM', dialCode: '+993', label: 'Turkmenistan (+993)' },
    {
      code: 'TC',
      dialCode: '+1-649',
      label: 'Turks and Caicos Islands (+1-649)',
    },
    { code: 'TV', dialCode: '+688', label: 'Tuvalu (+688)' },
    { code: 'UG', dialCode: '+256', label: 'Uganda (+256)' },
    { code: 'UA', dialCode: '+380', label: 'Ukraine (+380)' },
    { code: 'AE', dialCode: '+971', label: 'United Arab Emirates (+971)' },
    { code: 'GB', dialCode: '+44', label: 'United Kingdom (+44)' },
    { code: 'US', dialCode: '+1', label: 'United States (+1)' },
    { code: 'UY', dialCode: '+598', label: 'Uruguay (+598)' },
    { code: 'UZ', dialCode: '+998', label: 'Uzbekistan (+998)' },
    { code: 'VU', dialCode: '+678', label: 'Vanuatu (+678)' },
    { code: 'VA', dialCode: '+379', label: 'Vatican City (+379)' },
    { code: 'VE', dialCode: '+58', label: 'Venezuela (+58)' },
    { code: 'VN', dialCode: '+84', label: 'Vietnam (+84)' },
    { code: 'WF', dialCode: '+681', label: 'Wallis and Futuna (+681)' },
    { code: 'YE', dialCode: '+967', label: 'Yemen (+967)' },
    { code: 'ZM', dialCode: '+260', label: 'Zambia (+260)' },
    { code: 'ZW', dialCode: '+263', label: 'Zimbabwe (+263)' },
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

    // const country = this.countries.find(
    //   (c) => c.code === this.selectedCountryCode()
    // );
    // const dial = country?.dialCode ?? '';
    const tentative = `${national}`;

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
