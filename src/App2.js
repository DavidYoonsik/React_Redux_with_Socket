import React from 'react';
import { PostContainer } from './containers';
import { Header } from './components';
import * as service from './services/post';


class App extends React.Component{
    constructor() {
        super();
        this.state = {
            data: 0,
            name: 'Who are you?',
        }
    }

    fetchNameInfo = async() => {

        // 여러개의 Promise 를 한꺼번에 처리하고 기다릴 때는, Promise.all 을 사용
        try{
            const info = await Promise.all([
                service.getName()
            ]);

            console.log(info);

            // 변수 할당
            const name_ = info[0].data;

            this.setState({
                name: "유윤식"
            });

        }catch(e){
            this.setState({
                name: '유윤식'
            });
            console.log('error occurred', e);
        }
    }

    componentDidMount() {
        this.fetchNameInfo();
    }

    render(){
        const {name} = this.state;
        return(
            <div id="app">
                <Header name={name} />
                <PostContainer />
            </div>
        );
    }
}

export default App;

