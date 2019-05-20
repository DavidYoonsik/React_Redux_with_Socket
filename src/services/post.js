import axios from 'axios';

export function getPost(postId) {
    return axios.get('https://jsonplaceholder.typicode.com/posts/' + postId);
}

export function getComments(postId) {
    return axios.get(`https://jsonplaceholder.typicode.com/posts/${postId}/comments`)
}

export function getName(){
    return axios.get(`http://192.168.2.11:8787/getName`)
}

export function hell() {
    return axios.get(`http://192.168.2.11:8787/getData`)
}