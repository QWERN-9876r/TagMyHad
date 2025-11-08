export function hash(obj: any): string {
    const str = JSON.stringify(obj)
    let hash = 5381

    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) + hash + str.charCodeAt(i)
    }

    return (hash >>> 0).toString(36)
}
