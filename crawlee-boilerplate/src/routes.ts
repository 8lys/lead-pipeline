import { Dataset, createPlaywrightRouter } from 'crawlee';

export const router = createPlaywrightRouter();

router.addHandler('documentTypeSearch', async ({ page, log }) => {
    log.info('Router: Document Type Search Handler');

    function formatDate(date: Date): string {
        let month: number = date.getMonth() + 1; //js months are 0 indexed
        let day: number = date.getDate();
        let year: number = date.getFullYear();
        
        return (month < 10 ? '0' : '') + month + '/' + (day < 10 ? '0' : '') + day + '/' + year; //MM/DD/YYYY;
    };

    const DISTRICT: string = '301'; // 301 is the district code for Anchorage
    const DOCUMENT_TYPE: string = 'M'; //'M' is the index code for Mortgage
    const SEARCH_FROM_DATE: string = formatDate(new Date(Date.now() - (90 * 24 * 60 * 60 * 1000)));//Today's date minus 90 days: days * hours * minutes * seconds * milliseconds

   await page.selectOption('#District', DISTRICT);
   await page.selectOption('#IndexCode', DOCUMENT_TYPE);
   await page.type('#datepicker', SEARCH_FROM_DATE);

   await Promise.all([
        page.waitForNavigation(),
        page.locator('button[name="Document Type Search"]').click(),
        page.waitForSelector('#indexdocs')
   ]);

    // Obtain and print list of search results
    const results: {url: string, desc: string}[] = await page.$$eval('#indexdocs table tbody tr', (records) => {
        let scrapedData: {url: string, desc: string}[] = [];
        records.forEach((item) => {
            let collection = item.getElementsByTagName('td');
            let data: (string | null)[] = Array.from(collection, (element) => {
                return (element.firstElementChild?.hasAttribute('href')) ? element.firstElementChild.getAttribute('href') : element.innerText;
            });
            if (!(null === data[3]) && !(null === data[0]) && data[3].includes('RECON')) {
                scrapedData.push({
                    url: data[0],
                    desc: data[3]
                });
            }
        });

        return scrapedData;
    });

    log.info('Results:', results);

    // Store data in default dataset
    await Dataset.pushData(results);    
});