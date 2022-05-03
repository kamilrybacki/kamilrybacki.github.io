
interface Dictionary<T> {
    [Key: string]: T | Dictionary;
}

export { Dictionary };
