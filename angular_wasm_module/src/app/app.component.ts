import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CameraService } from 'src/hooks/useCamera';
import { CameraFaceMode } from '@privateid/cryptonets-web-sdk/dist/types';
import { ScanBackDocumentService } from 'src/hooks/useScanBackDocument';
import { WasmService } from 'src/hooks/useWasm';
import {
  canvasSizeOptions,
  ElementId,
  frontDocumentStatusMessage,
  WIDTH_TO_STANDARDS,
} from 'src/utils';
import { closeCamera, switchCamera } from '@privateid/cryptonets-web-sdk';
import { ScanFrontDocumentService } from 'src/hooks/useScanFrontDocumentWithoutPredict';
import { IsValidService } from 'src/hooks/useIsValid';
import { EnrollOneFaService } from 'src/hooks/useEnrollOneFa';
import { DeleteService } from 'src/hooks/useDelete';

interface Device {
  value: number;
  label: string;
}
interface ScannedCodeData {
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  streetAddress1: string;
  streetAddress2: string;
  city: string;
  postCode: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'wasmsample';
  isShowBackDocument = false;
  isShowFrontDocument = false;
  isShowValid = false;
  isShowEnroll = false;
  isShowDelete = false;
  devices: Device[] = [];
  selectedCamera: number | undefined;
  barcodeStatusCode: number | undefined;
  canvasSizeList = canvasSizeOptions;
  initialCanvasSize: string | undefined;
  scannedCodeData: ScannedCodeData | undefined;
  frontDocumentData: any = undefined;
  getFrontDocumentStatusMessage = frontDocumentStatusMessage;
  antiSpoofPerformed: boolean | any = '';
  antiSpoofStatus: any = '';
  isvalidStatus: any = '';
  enrollStatus: any = '';
  enrollValidationStatus: any = '';
  enrollMessage: any = '';
  enrollPUID: any = '';
  deleteStatus: any = '';

  private barcodeStatusCodeSubscription: Subscription | undefined;
  private scanCodeSubscription: Subscription | undefined;
  private cameraReadySubscription: Subscription | undefined;
  private getResultSubscription: Subscription | undefined;
  private antispoofPerformed: Subscription | undefined;
  private antispoofStatus: Subscription | undefined;
  private isValidStatus: Subscription | undefined;
  private enrollStatusSubscription: Subscription | undefined;
  private enrollValidationStatusSubscription: Subscription | undefined;
  private enrollMessageSubscription: Subscription | undefined;
  private enrollPUIDSubscription: Subscription | undefined;
  private deleteStatusSubscription: Subscription | undefined;

  constructor(
    private scanBackDocumentService: ScanBackDocumentService,
    private scanFrontDocumentService: ScanFrontDocumentService,
    private cameraService: CameraService,
    private wasmService: WasmService,
    private isValidService: IsValidService,
    private enrollOneFaService: EnrollOneFaService,
    private deleteService: DeleteService
  ) {}

  ngOnInit() {
    // Initialize Wasm and Camera services
    this.wasmService.init().then(() => {
      this.wasmService.useWasm().then((result) => {});
    });
    this.cameraInit();

    // Camera devices, and camera features
    this.cameraReadySubscription = this.cameraService.ready$.subscribe(
      (ready: boolean) => {
        console.log(ready, 'ready');
      }
    );
    this.cameraReadySubscription = this.cameraService.devices$.subscribe(
      (devices: Device[] | any) => {
        this.devices = devices;
        this.selectedCamera = devices[0]?.value;
        this.initialCanvasSize = canvasSizeOptions?.[0]?.value;
        console.log({ selectedCamera: devices[0]?.value, devices: devices });
      }
    );
    this.cameraReadySubscription = this.cameraService.cameraFeatures$.subscribe(
      (features) => {
        this.initialCanvasSize = WIDTH_TO_STANDARDS[features?.settings?.width];
      }
    );

    // Subscribe to barcode status code and scanned code data fo back document
    this.barcodeStatusCodeSubscription = this.scanBackDocumentService
      .getBarcodeStatusCodeObservable()
      .subscribe((statusCode) => {
        if (statusCode !== null) {
          this.barcodeStatusCode = statusCode;
        }
      });

    this.scanCodeSubscription = this.scanBackDocumentService
      .getScannedCodObservable()
      .subscribe((scanData) => {
        if (scanData) {
          this.scannedCodeData = scanData;
        }
      });

    // Subscribe to scanned code data fo front document
    this.getResultSubscription = this.scanFrontDocumentService
      .getResultResponseObservable()
      .subscribe((data) => {
        if (data) {
          this.frontDocumentData = data;
        }
      });

    // Is Valid Service
    this.antispoofPerformed = this.isValidService.antispoofPerformed$.subscribe(
      (data: any) => {
        this.antiSpoofPerformed = data;
      }
    );
    this.antispoofStatus = this.isValidService.antispoofStatus$.subscribe(
      (data: any) => {
        this.antiSpoofStatus = data;
      }
    );
    this.isValidStatus = this.isValidService.isValidStatus$.subscribe(
      (data: any) => {
        this.isvalidStatus = data;
      }
    );

    this.enrollStatusSubscription = this.enrollOneFaService.enrollStatus$.subscribe(
      (data: any) => {
        this.enrollStatus = data;
      }
    );

    this.enrollValidationStatusSubscription = this.enrollOneFaService.enrollValidationStatus$.subscribe(
      (data: any) => {
        this.enrollValidationStatus = data;
      }
    );

    this.enrollMessageSubscription = this.enrollOneFaService.enrollMessage$.subscribe(
      (data: any) => {
        this.enrollStatus = data;
      }
    );

    this.enrollPUIDSubscription = this.enrollOneFaService.enrollPUID$.subscribe(
      (data: any) => {
        this.enrollPUID = data;
      }
    );

    this.deleteStatusSubscription = this.deleteService.deleteStatus$.subscribe(
      (data: any) => {
        this.deleteStatus = data;
      }
    );

  }

  ngOnDestroy() {
    // Unsubscribe from subscriptions to prevent memory leaks
    if (this.cameraReadySubscription) {
      this.cameraReadySubscription.unsubscribe();
    }
    if (this.barcodeStatusCodeSubscription) {
      this.barcodeStatusCodeSubscription.unsubscribe();
    }
    if (this.scanCodeSubscription) {
      this.scanCodeSubscription.unsubscribe();
    }
    if (this.antispoofPerformed) {
      this.antispoofPerformed.unsubscribe();
    }
    if (this.getResultSubscription) {
      this.getResultSubscription.unsubscribe();
    }
    if (this.antispoofStatus) {
      this.antispoofStatus.unsubscribe();
    }
    if (this.isValidStatus) {
      this.isValidStatus.unsubscribe();
    }
    if (this.enrollStatusSubscription) {
      this.enrollStatusSubscription.unsubscribe();
    }
    if (this.enrollValidationStatusSubscription) {
      this.enrollValidationStatusSubscription.unsubscribe();
    }
    if (this.enrollMessageSubscription) {
      this.enrollMessageSubscription.unsubscribe();
    }
    if (this.enrollPUIDSubscription) {
      this.enrollPUIDSubscription.unsubscribe();
    }
    if (this.deleteStatusSubscription) {
      this.deleteStatusSubscription.unsubscribe();
    }
  }

  private cameraInit() {
    this.cameraService.readySubject.next(false);
    this.cameraService.init(
      ElementId,
      CameraFaceMode.front,
      false,
      () => {
        console.log('Camera initialization failed.');
      },
      false
    );
  }

  onBackDocumentScan() {
    this.isShowBackDocument = true;
    this.scanBackDocumentService.scanBackDocument();
    this.scannedCodeData = undefined;
    this.barcodeStatusCode = undefined;
    this.isShowFrontDocument = false;
  }

  onFrontDocumentScan() {
    this.isShowFrontDocument = true;
    this.isShowBackDocument = false;
    this.scanFrontDocumentService.scanFrontDocument();
  }

  onCloseCamera = async () => {
    await closeCamera(ElementId);
  };

  onOpenCamera() {
    this.cameraInit();
  }

  onCameraChange(e: any) {
    this.selectedCamera = e?.target?.value;
    switchCamera(null, e?.target?.value);
  }

  onMugshotImage() {
    navigator.clipboard.writeText(this.scanFrontDocumentService.mugshotBase64);
  }

  onDocumentImage() {
    navigator.clipboard.writeText(
      this.scanFrontDocumentService.croppedDocumentBase64
    );
  }

  onIsValid() {
    this.isShowValid = true;
    this.isShowFrontDocument = false;
    this.isShowBackDocument = false;
    this.isShowDelete = false;
    this.isShowEnroll = false;
    this.isValidService.isValidCall();
  }

  onEnrollOneFa() {
    this.isShowEnroll = true;
    this.isShowValid = false;
    this.isShowFrontDocument = false;
    this.isShowBackDocument = false;
    this.isShowDelete = false;
    this.enrollOneFaService.enrollUserOneFa();
  }

  onDelete() {
    this.isShowDelete = true;
    this.isShowEnroll = false;
    this.isShowValid = false;
    this.isShowFrontDocument = false;
    this.isShowBackDocument = false;
    this.deleteService.deleteUser(this.enrollPUID);
  }
}
