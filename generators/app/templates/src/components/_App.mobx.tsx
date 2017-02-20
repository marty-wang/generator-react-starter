import * as React from 'react';
import { observer } from 'mobx-react';
import { Store } from 'src/store';
import { Counter } from 'src/components/Counter';

export interface IAppProps {
    store: Store;
}

@observer
export class App extends React.Component<IAppProps, void> {
    public render() {
        const { store } = this.props;
        return (
            <div>
                <h1>Hello React!</h1>
                <Counter
                    count={store.count}
                    onDecrease={() => store.decrease()}
                    onIncrease={() => store.increase()}/>
            </div>
        );
    }
}
