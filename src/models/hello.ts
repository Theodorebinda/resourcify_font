export class HelloResponse {
  titre: string;
  message: string;
  status: number;
  image: string;

  constructor(titre: string, message: string, status: number, image: string) {
    this.titre = titre;
    this.message = message;
    this.status = status;
    this.image = image;
  }
}
