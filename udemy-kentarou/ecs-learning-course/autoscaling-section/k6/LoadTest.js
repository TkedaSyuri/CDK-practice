import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
    vus: 10,
    duration: '300s',
};

export default function () {
    http.get('http://my-app-autoscaling-alb-1670893609.us-west-2.elb.amazonaws.com:8080/api/encryptor');
    sleep(1);
}
