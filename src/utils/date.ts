function convertDateFromInt(date: string): string {
    let _date = new Date(parseInt(date.match(/\d+/)?.[0] ?? "")).toLocaleDateString().split(',')[0];
    let [ day, month, year ] = [..._date.split('/')];
    return `${month.padStart(2, '0')}-${day.padStart(2, '0')}-${year.padStart(4, '0')}`;
}

export { convertDateFromInt };