import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {deleteUser} from '@privateid/cryptonets-web-sdk';

@Injectable({
    providedIn: 'root',
})
export class DeleteService {
    private deleteStatusSubject = new BehaviorSubject<string>('');
    private deleteLoadingSubject = new BehaviorSubject<boolean>(false);

    deleteStatus$: Observable<string> = this.deleteStatusSubject.asObservable();
    deleteLoading$: Observable<boolean> = this.deleteLoadingSubject.asObservable();

    constructor() {
    }

    private callback = (result: any) => {
        this.deleteLoadingSubject.next(false);
        this.deleteStatusSubject.next(result.returnValue.status === 0 ? 'success' : result.returnValue.message);
    };

    async deleteUser(puid: string): Promise<void> {
        this.deleteLoadingSubject.next(true);
        try {
            await deleteUser(puid, this.callback);
        } catch (error) {
            // Handle error if necessary
        }
    }
}
