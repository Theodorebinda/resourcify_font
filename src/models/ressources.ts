// ... existing code ...
export class Resource {
  id: number;
  title: string;
  summary: string;
  author: string;
  date: Date;

  constructor(
    id: number,
    title: string,
    summary: string,
    author: string,
    date: string
  ) {
    this.id = id;
    this.title = title;
    this.summary = summary;
    this.author = author;
    this.date = new Date(date);
  }

  getFormattedDate(): string {
    return this.date.toLocaleDateString();
  }
}
// ... existing code ...
