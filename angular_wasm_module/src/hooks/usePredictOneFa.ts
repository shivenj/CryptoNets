import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {predict1FA} from '@privateid/cryptonets-web-sdk';

@Injectable({
    providedIn: 'root',
})
export class PredictOneFaService {
    private predictMessageSubject = new BehaviorSubject<string>('');
    private predictAntispoofPerformedSubject = new BehaviorSubject<string>('');
    private predictAntispoofStatusSubject = new BehaviorSubject<string>('');
    private predictValidationStatusSubject = new BehaviorSubject<string>('');
    private predictGUIDSubject = new BehaviorSubject<string>('');
    private predictPUIDSubject = new BehaviorSubject<string>('');
    private skipAntispoofProcess = false;

    predictMessage$: Observable<string> = this.predictMessageSubject.asObservable();
    predictAntispoofPerformed$: Observable<string> = this.predictAntispoofPerformedSubject.asObservable();
    predictAntispoofStatus$: Observable<string> = this.predictAntispoofStatusSubject.asObservable();
    predictValidationStatus$: Observable<string> = this.predictValidationStatusSubject.asObservable();
    predictGUID$: Observable<string> = this.predictGUIDSubject.asObservable();
    predictPUID$: Observable<string> = this.predictPUIDSubject.asObservable();

    constructor() {
    }

    private callback = (result: any) => {
        console.log('predict callback hook result:', result);

        switch (result.status) {
            case 'WASM_RESPONSE':
                if (result.returnValue?.status === 0) {
                    const {message} = result.returnValue;
                    this.predictMessageSubject.next(message);
                    this.predictAntispoofPerformedSubject.next(result.returnValue.anti_spoof_performed || '');
                    this.predictAntispoofStatusSubject.next(result.returnValue.anti_spoof_status || '');
                    this.predictValidationStatusSubject.next(result.returnValue.status);
                    this.predictGUIDSubject.next(result.returnValue.guid);
                    this.predictPUIDSubject.next(result.returnValue.puid);
                }

                if (result.returnValue?.status !== 0) {
                    const {status, message} = result.returnValue;
                    this.predictMessageSubject.next(message);
                    this.predictAntispoofPerformedSubject.next(result.returnValue.anti_spoof_performed);
                    this.predictAntispoofStatusSubject.next(result.returnValue.anti_spoof_status);
                    this.predictValidationStatusSubject.next(result.returnValue.status);
                    this.predictGUIDSubject.next(result.returnValue.guid);
                    this.predictPUIDSubject.next(result.returnValue.puid);
                    this.predictUserOneFa(this.skipAntispoofProcess, true);
                }
                break;
            default:
        }
    };

    async predictUserOneFa(skipAntispoof = true, isRunning = false): Promise<void> {
        this.skipAntispoofProcess = skipAntispoof;
        if (!isRunning) {
            this.predictAntispoofPerformedSubject.next('');
            this.predictAntispoofStatusSubject.next('');
            this.predictValidationStatusSubject.next('');
            this.predictGUIDSubject.next('');
            this.predictPUIDSubject.next('');
        }
        try {
            await predict1FA(this.callback, {
                // skip_antispoof: skipAntispoof,
                input_image_format: 'rgba',
                anti_spoofing_detect_document: false,
            } as any);
        } catch (error) {
            // Handle error if necessary
        }
    }
}

export const USER_NOT_ENROLLED_STATUS = -7;
