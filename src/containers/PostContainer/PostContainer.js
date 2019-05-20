import React, {Component} from 'react';
import { PostWrapper, Navigate, Post, Warning } from '../../components';
import * as service from '../../services/post';

class PostContainer extends Component {

    constructor(){
        super();
        this.state={
            postId: 1,
            fetching: false,
            post:{
                title: null,
                body: null,
            },
            comments: [],
            real: null,
            warningVisibility: false,
        }
    }

    // Warning Visibility
    showWarning = () => {
        this.setState({
            warningVisibility: true
        });

        // 3 secs interval
        setTimeout(
            () => {
                this.setState({
                    warningVisibility: false
                });
            }, 1500
        );
    }

    // Navigator Handler
    handleNavigateClick = (type) => {
        const postId = this.state.postId;

        if (type === 'NEXT'){
            this.fetchPostInfo(postId+1)
        }else{
            this.fetchPostInfo(postId-1);
        }
    }

    // => : No need to use bind for implementing component
    // 에러처리 필요
    fetchPostInfo = async(postId) => {
        // const post = await service.getPost(postId);
        // console.log(post);
        // const comments = await service.getComments(postId);
        // console.log(comments);

        // 요청전에 state 값을 지정
        this.setState({
            fetching: true
        });

        // 여러개의 Promise 를 한꺼번에 처리하고 기다릴 때는, Promise.all 을 사용
        try{
            const info = await Promise.all([
                service.getPost(postId),
                service.getComments(postId)
            ]);

            console.log(info);

            // 변수 할당
            const {title, body} = info[0].data;
            const comments = info[1].data;

            this.setState({
                postId,
                post: {
                    title,
                    body
                },
                comments,
                fetching: false
            });

        }catch(e){
            this.setState({
                fetching: false
            });
            this.showWarning();
            console.log('error occurred', e);
        }
    }

    onSocketOpen() {
        console.log('Connection established!')
    }

    onSocketData(message){
        // console.log(message)
        // console.log(JSON.parse(message.data));
        let decoded = JSON.parse(message.data)
        // console.log(decoded)
        this.setState({
            real: decoded
        });
    }

    onSocketClose(){
        console.log('socket closed');
    }

    componentDidMount() {
        this.fetchPostInfo(1);

        this.socket = new WebSocket("ws://" + document.domain + ":8000/dns2");
        this.socket.onopen = () => this.onSocketOpen()
        this.socket.onmessage = (m) => this.onSocketData(m)
        this.socket.onclose = () => this.onSocketClose()

    }

    componentWillUnmount() {
        console.log('component will be un-mounted')
    }

    render() {
        const {postId, fetching, post, comments, real, warningVisibility} = this.state;

        return (
            <PostWrapper>
                <Navigate
                    postId={postId}
                    disabled={fetching}
                    onClick={this.handleNavigateClick}
                />
                <Post
                    title={post.title}
                    body={post.body}
                    comments={comments}
                    real={real}
                />

                <Warning visible={warningVisibility} message="That post does not exist"/>
            </PostWrapper>
        );
    }
}

export default PostContainer;