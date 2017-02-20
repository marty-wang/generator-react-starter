import { observable } from 'mobx';

export class Store {
    @observable public count = 0;

    public increase() {
        this.count++;
    }

    public decrease() {
        this.count--;
    }
}
