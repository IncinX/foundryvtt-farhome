export function getDieImage(images, die, face) {
    const dieImages = images.get(die);
    if (dieImages !== undefined) {
        const image = dieImages.get(face);
        if (image !== undefined) {
            return image;
        } else {
            throw new Error(`Unknown face ${face}`);
        }
    } else {
        throw new Error(`Unknown die ${die}`);
    }
}
