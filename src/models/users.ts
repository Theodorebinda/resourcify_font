export class User {
  id: string;
  name: string;
  image: string;
  email: string;
  createdAt: Date;

  constructor(
    id: string,
    name: string,
    email: string,
    image: string,
    createdAt: Date
  ) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.image = image;
    this.createdAt = createdAt;
  }
}
