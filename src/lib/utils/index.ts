export function formatCurrency(amount: number){
    return new Intl.NumberFormat('en-US',{
        style:'currency',
        currency: 'USD'
    }).format(amount)
}

export function getImagePath(imagePath: string){
    const cloudinaryBaseUrl='https://res.cloudinary.com'
    if (imagePath.startsWith(cloudinaryBaseUrl)) {
        return imagePath
    }else{
        return`/products/${imagePath}.jpg`
    }
}

export function formatDate(date: string | Date) {
    const fecha = new Date(date);
    return fecha.toLocaleDateString('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}