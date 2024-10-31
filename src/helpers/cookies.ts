export class Cookies {
  private static instance?: Cookies

  public static create(): Cookies {
    Cookies.instance ??= new Cookies()
    return Cookies.instance
  }

  public values: Record<string, string>

  public constructor(cookie = document.cookie) {
    this.values = cookie
      .split(';')
      .reduce((result, setting) => {
        const [key, value] = setting
          .trim()
          .split('=')

        if (
          key === undefined ||
          value === undefined
        ) {
          return result
        }

        return {
          [key]: decodeURIComponent(value),
          ...result,
        }
      }, {})
  }

  public get(name: string): string | undefined {
    return this.values[name]
  }

  public has(name: string): boolean {
    return this.values[name] !== undefined
  }

  public set(name: string, value: string): this {
    this.values[name] = value
    document.cookie = `${name}=${value}; Path=/; SameSite=Lax; Secure`
    return this
  }
}
