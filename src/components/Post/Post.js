import React from 'react';
import './Post.css';
import { CommentList } from '../'

const Post = ( { title, body, comments, real, alert } ) => (
    <div className="Post">
        <h1>{title}</h1>
        <p>
            {body}
        </p>
        <CommentList
            comments={comments}
            real={real}
            alert={alert}
        />
    </div>
);

export default Post;