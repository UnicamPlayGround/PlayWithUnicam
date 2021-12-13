export class Question {
    question: String;
    answers: String[];
    imgUrl: String;
    videoUrl: String;

    constructor(question: String, answers: String[], imgUrl: String, videoUrl: String) {
        this.question = question;
        this.answers = answers;
        this.imgUrl = imgUrl;
        this.videoUrl = videoUrl;
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