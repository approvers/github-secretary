export type EmbedThumbnail = {
  url?: string;
  proxy_url?: string;
  height?: number;
  width?: number;
};

export type EmbedVideo = {
  url?: string;
  height?: number;
  width?: number;
};

export type EmbedImage = {
  url?: string;
  proxy_url?: string;
  height?: number;
  width?: number;
};

export type EmbedProvider = {
  name?: string;
  url?: string;
};

export type EmbedAuthor = {
  name?: string;
  url?: string;
  icon_url?: string;
  proxy_icon_url?: string;
};

export type EmbedFooter = {
  text: string;
  icon_url?: string;
  proxy_icon_url?: string;
};

export type EmbedField = {
  name: string;
  value: string;
  inline?: boolean;
};

export type EmbedObject = {
  title?: string;
  type?: "rich" | "image" | "video" | "gifv" | "article" | "link";
  description?: string;
  url?: string;
  timestamp?: Date;
  color?: number;
  footer?: EmbedFooter;
  image?: EmbedImage;
  thumbnail?: EmbedThumbnail;
  video?: EmbedVideo;
  provider?: EmbedProvider;
  author?: EmbedAuthor;
  fields?: EmbedField[];
};

export class EmbedMessage {
  constructor(private obj: EmbedObject = {}) {}

  color(color: number): EmbedMessage {
    return new EmbedMessage({ ...this.obj, color });
  }

  url(url: string): EmbedMessage {
    return new EmbedMessage({ ...this.obj, url });
  }

  title(title: string): EmbedMessage {
    return new EmbedMessage({ ...this.obj, title });
  }

  description(description: string): EmbedMessage {
    return new EmbedMessage({ ...this.obj, description });
  }

  author(author: EmbedAuthor): EmbedMessage {
    return new EmbedMessage({ ...this.obj, author });
  }

  footer(footer: EmbedFooter): EmbedMessage {
    return new EmbedMessage({ ...this.obj, footer });
  }

  field(field: EmbedField): EmbedMessage {
    return new EmbedMessage(
      { ...this.obj, fields: [...(this.obj.fields || []), field] },
    );
  }

  fields(...fields: EmbedField[]): EmbedMessage {
    return new EmbedMessage({ ...this.obj, fields: [...fields] });
  }

  raw(): unknown {
    return this.obj;
  }
}
