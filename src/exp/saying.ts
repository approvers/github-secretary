export type Saying = string;

export namespace Saying {
  export const validateSaying = (obj: any): obj is Saying => {
    return typeof obj === 'string';
  };
}
