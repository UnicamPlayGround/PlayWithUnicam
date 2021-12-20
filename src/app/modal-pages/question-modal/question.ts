export class Question {
    question: String;
    answers: String[];
    imgUrl: String;
    videoUrl: String;
    countdownSeconds: number;

    constructor(question: String, answers: String[], imgUrl: String, videoUrl: String, countdownSeconds: number) {
        this.question = question;
        this.answers = answers;
        this.imgUrl = imgUrl;
        this.videoUrl = videoUrl;
        this.countdownSeconds = countdownSeconds;
    }

    getJSON() {
        var json: any = {};
        json.q = this.question;
        json.answers = this.answers;
        json.img_url = this.imgUrl;
        json.video_url = this.videoUrl;
        return json;
    }
}