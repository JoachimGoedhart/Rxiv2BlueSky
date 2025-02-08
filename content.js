function getPaperInfo() {
  try {
    const titleElement = document.querySelector('h1.highwire-cite-title');
    const authors = Array.from(document.querySelectorAll('.highwire-citation-author'));
    
    if (!titleElement || authors.length === 0) {
      return null;
    }
    
    const title = titleElement.textContent.trim();
    const lastAuthor = authors[authors.length - 1].textContent.trim();
    
    return {
      title,
      lastAuthor
    };
  } catch (error) {
    return null;
  }
}

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getPaperInfo") {
    sendResponse(getPaperInfo());
  }
});