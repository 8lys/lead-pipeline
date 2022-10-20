import { Dataset, createPlaywrightRouter } from 'crawlee';

export const router = createPlaywrightRouter();

// router.addDefaultHandler(async ({ enqueueLinks, log }) => {
//     log.info(`Enqueueing new URLs`);
//     await enqueueLinks({
//         globs: ['https://crawlee.dev/**'],
//         label: 'detail',
//     });
// });

router.addHandler('documentTypeSearch', async ({ request, page, log }) => {
    const DISTRICT: string = '301';
    const DOCUMENT_TYPE: string = 'M' //'M' is the index code for Mortgage
    const SEARCH_FROM_DATE: string = new Date(Date.now() - 7776000000).toLocaleDateString();

    // const submitForm = await page.evaluate(([DISTRICT, DOCUMENT_TYPE, SEARCH_FROM_DATE]) => {
    //   document.getElementById('District').value = DISTRICT;
    //   document.getElementById('IndexCode').value = DOCUMENT_TYPE;
    //   document.getElementById('datepicker').value = SEARCH_FROM_DATE;
    //   document.getElementsByName('FORM').submit();
    // }, [DISTRICT, DOCUMENT_TYPE, SEARCH_FROM_DATE]);

    await page.selectOption('#District', DISTRICT);
    await page.selectOption('#IndexCode', DOCUMENT_TYPE);
    await page.type('#datepicker', SEARCH_FROM_DATE);

    await Promise.all([
        page.waitForNavigation(),
        page.click('button[name="Document Type Search"]')
    ]);

    // Obtain and print list of search results
    const results: [{url: string, desc: string}] = await page.$$eval('#indexdocs table tbody tr', (records) => {
        let result: [] = [];
        let items = document.querySelectorAll('#indexdocs table tbody tr');
        records.forEach((item) => {
            let collection = item.getElementsByTagName('td');
            let data = Array.from(collection, (element) => {
                return (element.firstElementChild) ? element.firstElementChild.href : element.innerText;
            });
            if (data[3].includes('NTC OF DEFAULT')) {
                results.push({
                    url: data[0],
                    desc: data[3]
                });
            }
        });
        return results;
    });

    log.info('Results:', results);

    // Store data in default dataset
    await Dataset.pushData(results);
    
    log.info('request', request);
});
