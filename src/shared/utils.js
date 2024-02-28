export function toJson(acc, curr) {
    const [key, value] = curr
    acc[key] = value
    return acc
}