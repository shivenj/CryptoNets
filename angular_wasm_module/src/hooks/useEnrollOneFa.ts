import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {enroll1FA} from '@privateid/cryptonets-web-sdk';

@Injectable({
  providedIn: 'root',
})
export class EnrollOneFaService {
  private enrollAntispoofPerformedSubject = new BehaviorSubject<string>('');
  private enrollAntispoofStatusSubject = new BehaviorSubject<string>('');
  private enrollValidationStatusSubject = new BehaviorSubject<string>('');
  private enrollGUIDSubject = new BehaviorSubject<string>('');
  private enrollPUIDSubject = new BehaviorSubject<string>('');
  private enrollTokenSubject = new BehaviorSubject<string>('');
  private enrollImageDataSubject = new BehaviorSubject<ImageData | null>(null);
  private enrollMessageSubject = new BehaviorSubject<string>('');
  private enrollStatusSubject = new BehaviorSubject<string>('');
  private progressSubject = new BehaviorSubject<number>(0);

  private enrollCount = 0;
  private enrollTokenCurrent: string = '';
  private skipAntispoofProcess = false;

  enrollAntispoofPerformed$: Observable<string> = this.enrollAntispoofPerformedSubject.asObservable();
  enrollAntispoofStatus$: Observable<string> = this.enrollAntispoofStatusSubject.asObservable();
  enrollValidationStatus$: Observable<string> = this.enrollValidationStatusSubject.asObservable();
  enrollGUID$: Observable<string> = this.enrollGUIDSubject.asObservable();
  enrollPUID$: Observable<string> = this.enrollPUIDSubject.asObservable();
  enrollToken$: Observable<string> = this.enrollTokenSubject.asObservable();
  enrollImageData$: Observable<ImageData | null> = this.enrollImageDataSubject.asObservable();
  enrollMessage$: Observable<string> = this.enrollMessageSubject.asObservable();
  enrollStatus$: Observable<string> = this.enrollStatusSubject.asObservable();
  progress$: Observable<number> = this.progressSubject.asObservable();

  constructor() {}

  private callback = (result: any) => {
    console.log('enroll callback hook result:', result);
    console.log('skipping antispoof?', this.skipAntispoofProcess);
    this.enrollStatusSubject.next(ENROLL_MESSAGE_OBJ[result.returnValue.validation_status?.[0]?.status]);
    if (result.returnValue.status === 0) {
      if (result.returnValue.guid && result.returnValue.puid) {
        this.enrollGUIDSubject.next(result.returnValue.guid);
        this.enrollPUIDSubject.next(result.returnValue.puid);
        this.enrollAntispoofPerformedSubject.next('');
        this.enrollAntispoofStatusSubject.next('');
        this.enrollValidationStatusSubject.next('');
        this.enrollMessageSubject.next(result.returnValue.message);
        this.progressSubject.next(100);
        this.enrollCount++;
        console.log('Enroll Count:', this.enrollCount);
      } else {
        this.handleValidationStatus(result.returnValue.validation_status, result.returnValue.message);
      }
    } else {
      this.handleValidationStatus(result.returnValue.validation_status, result.returnValue.message);
    }
  };

  private handleValidationStatus(validationStatus: any[], message: string) {
    if (validationStatus.length > 0) {
      this.enrollTokenSubject.next(validationStatus[0].enroll_token);
      this.enrollAntispoofPerformedSubject.next(validationStatus[0].anti_spoof_performed);
      this.enrollAntispoofStatusSubject.next(validationStatus[0].anti_spoof_status);
      this.enrollValidationStatusSubject.next(validationStatus[0].status);
      this.enrollMessageSubject.next(message);
      console.log(this.skipAntispoofProcess,'this.skipAntispoofProcess');
      
      if (this.skipAntispoofProcess) {
        if (validationStatus[0].status === 0) {
          this.enrollUserOneFa(validationStatus[0].enroll_token, this.skipAntispoofProcess);
        } else {
          this.enrollUserOneFa('', this.skipAntispoofProcess);
        }
      } else {
        if (
          validationStatus[0].anti_spoof_performed &&
          validationStatus[0].anti_spoof_status === 0 &&
          validationStatus[0].status === 0
        ) {
          if (validationStatus[0].enroll_token === this.enrollTokenCurrent && this.enrollTokenCurrent) {
            this.enrollCount++;
          } else {
            this.enrollCount = 1;
          }
          this.enrollUserOneFa(validationStatus[0].enroll_token, this.skipAntispoofProcess);
        } else {
          this.enrollUserOneFa(validationStatus[0].enroll_token, this.skipAntispoofProcess);
        }
      }
    } else {
      this.resetEnrollSubjects();
      this.enrollUserOneFa('', this.skipAntispoofProcess);
    }
  }

  private resetEnrollSubjects() {
    this.enrollTokenSubject.next('');
    this.enrollAntispoofPerformedSubject.next('');
    this.enrollAntispoofStatusSubject.next('');
    this.enrollValidationStatusSubject.next('');
    this.enrollMessageSubject.next('');
    this.progressSubject.next(0);
  }

  async enrollUserOneFa(token = '', skipAntispoof = false): Promise<void> {
    this.enrollTokenCurrent = token;
    this.skipAntispoofProcess = skipAntispoof;
    if (token) {
      if (this.progressSubject.value >= 100) return this.progressSubject.next(100);;
      this.progressSubject.next(this.progressSubject.value + 20);
    } else {
      this.progressSubject.next(0);
    }
    // disableButtons(true);
    try {
      const config = {
        input_image_format: 'rgba',
        mf_token: token,
        skip_antispoof: skipAntispoof,
        anti_spoofing_detect_document: false,
      };
      const bestImage = await enroll1FA(this.callback, config);

      if (bestImage) {
        // this.enrollImageDataSubject.next(new ImageData(bestImage.imageData, bestImage.width, bestImage.height));
      }
    } catch (error) {
      console.error(error);
      this.resetEnrollSubjects();
    }
  }
}

export const ENROLL_MESSAGE_OBJ: any = {
  [-100]: 'Looking for face',
  [-4]: 'Invalid Face',
  [-3]: 'Face Too Close To Edge',
  [-2]: 'Mobile Phone Detected',
  [-1]: 'No Face Detected',
  [0]: 'Valid face',
  [1]: 'Image spoof',
  [2]: 'Video spoof',
  [3]: 'Too close',
  [4]: 'Too far',
  [5]: 'Close to right edge',
  [6]: 'Close to left edge',
  [7]: 'Close to top edge',
  [8]: 'Close to bottom edge',
  [9]: 'Too blurry',
  [11]: 'Facemask detected',
  [12]: 'Chin too far left',
  [13]: 'Chin too far right',
  [14]: 'Chin too far up',
  [15]: 'Chin too far down',
  [16]: 'Image too dim',
  [17]: 'Image too bright',
  [18]: 'Face low confidence value',
  [19]: 'Invalid face background',
  [20]: 'Eyes closed',
  [21]: 'Mouth open',
  [22]: 'Face tilted right',
  [23]: 'Face tilted left',
};


