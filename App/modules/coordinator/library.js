(function() {
    const mainContent = document.getElementById('main-content');

    const Library = {
        books: [
            { id: 'b1', title: 'Alice in Wonderland', author: 'Lewis Carroll', category: 'Classic', cover: 'https://www.gutenberg.org/cache/epub/11/pg11.cover.medium.jpg', url: 'https://www.gutenberg.org/files/11/11-h/11-h.htm' },
            { id: 'b2', title: 'The Jungle Book', author: 'Rudyard Kipling', category: 'Adventure', cover: 'https://www.gutenberg.org/cache/epub/236/pg236.cover.medium.jpg', url: 'https://www.gutenberg.org/files/236/236-h/236-h.htm' },
            { id: 'b3', title: 'Peter Pan', author: 'J.M. Barrie', category: 'Fantasy', cover: 'https://www.gutenberg.org/cache/epub/16/pg16.cover.medium.jpg', url: 'https://www.gutenberg.org/files/16/16-h/16-h.htm' },
            { id: 'b4', title: 'Grimms Fairy Tales', author: 'Brothers Grimm', category: 'Fairy Tale', cover: 'https://www.gutenberg.org/cache/epub/2591/pg2591.cover.medium.jpg', url: 'https://www.gutenberg.org/files/2591/2591-h/2591-h.htm' },
            { id: 'b5', title: 'Aesops Fables', author: 'Aesop', category: 'Moral', cover: 'https://www.gutenberg.org/cache/epub/11339/pg11339.cover.medium.jpg', url: 'https://www.gutenberg.org/files/11339/11339-h/11339-h.htm' },
            { id: 'b6', title: 'Mother Goose Rhymes', author: 'Traditional', category: 'Rhymes', cover: 'https://www.gutenberg.org/cache/epub/17208/pg17208.cover.medium.jpg', url: 'https://www.gutenberg.org/files/17208/17208-h/17208-h.htm' },
            { id: 'b7', title: 'Cinderella', author: 'Charles Perrault', category: 'Fairy Tale', cover: 'https://www.gutenberg.org/cache/epub/22300/pg22300.cover.medium.jpg', url: 'https://www.gutenberg.org/files/22300/22300-h/22300-h.htm' },
            { id: 'b8', title: 'The Velveteen Rabbit', author: 'Margery Williams', category: 'Story', cover: 'https://www.gutenberg.org/cache/epub/11757/pg11757.cover.medium.jpg', url: 'https://www.gutenberg.org/files/11757/11757-h/11757-h.htm' },
            { id: 'b9', title: 'Pinocchio', author: 'Carlo Collodi', category: 'Adventure', cover: 'https://www.gutenberg.org/cache/epub/500/pg500.cover.medium.jpg', url: 'https://www.gutenberg.org/files/500/500-h/500-h.htm' },
            { id: 'b10', title: 'A Child\'s Garden of Verses', author: 'R.L. Stevenson', category: 'Poetry', cover: 'https://www.gutenberg.org/cache/epub/19721/pg19721.cover.medium.jpg', url: 'https://www.gutenberg.org/files/19721/19721-h/19721-h.htm' },
            { id: 'b11', title: 'Treasure Island', author: 'R.L. Stevenson', category: 'Adventure', cover: 'https://www.gutenberg.org/cache/epub/120/pg120.cover.medium.jpg', url: 'https://www.gutenberg.org/files/120/120-h/120-h.htm' },
            { id: 'b12', title: 'Gulliver\'s Travels', author: 'Jonathan Swift', category: 'Classic', cover: 'https://www.gutenberg.org/cache/epub/829/pg829.cover.medium.jpg', url: 'https://www.gutenberg.org/files/829/829-h/829-h.htm' },
            { id: 'b13', title: 'Little Women', author: 'Louisa May Alcott', category: 'Classic', cover: 'https://www.gutenberg.org/cache/epub/514/pg514.cover.medium.jpg', url: 'https://www.gutenberg.org/files/514/514-h/514-h.htm' },
            { id: 'b14', title: 'The Secret Garden', author: 'Frances Hodgson', category: 'Fantasy', cover: 'https://www.gutenberg.org/cache/epub/113/pg113.cover.medium.jpg', url: 'https://www.gutenberg.org/files/113/113-h/113-h.htm' },
            { id: 'b15', title: 'Heidi', author: 'Johanna Spyri', category: 'Story', cover: 'https://www.gutenberg.org/cache/epub/1448/pg1448.cover.medium.jpg', url: 'https://www.gutenberg.org/files/1448/1448-h/1448-h.htm' },
            { id: 'b16', title: 'Black Beauty', author: 'Anna Sewell', category: 'Story', cover: 'https://www.gutenberg.org/cache/epub/271/pg271.cover.medium.jpg', url: 'https://www.gutenberg.org/files/271/271-h/271-h.htm' },
            { id: 'b17', title: 'The Railway Children', author: 'E. Nesbit', category: 'Adventure', cover: 'https://www.gutenberg.org/cache/epub/1874/pg1874.cover.medium.jpg', url: 'https://www.gutenberg.org/files/1874/1874-h/1874-h.htm' },
            { id: 'b18', title: 'The Wind in the Willows', author: 'Kenneth Grahame', category: 'Fantasy', cover: 'https://www.gutenberg.org/cache/epub/289/pg289.cover.medium.jpg', url: 'https://www.gutenberg.org/files/289/289-h/289-h.htm' },
            { id: 'b19', title: 'Anne of Green Gables', author: 'L.M. Montgomery', category: 'Classic', cover: 'https://www.gutenberg.org/cache/epub/45/pg45.cover.medium.jpg', url: 'https://www.gutenberg.org/files/45/45-h/45-h.htm' },
            { id: 'b20', title: 'The Wizard of Oz', author: 'L. Frank Baum', category: 'Fantasy', cover: 'https://www.gutenberg.org/cache/epub/55/pg55.cover.medium.jpg', url: 'https://www.gutenberg.org/files/55/55-h/55-h.htm' },
            { id: 'b21', title: 'The Call of the Wild', author: 'Jack London', category: 'Adventure', cover: 'https://www.gutenberg.org/cache/epub/215/pg215.cover.medium.jpg', url: 'https://www.gutenberg.org/files/215/215-h/215-h.htm' },
            { id: 'b22', title: 'Hans Christian Andersen', author: 'H.C. Andersen', category: 'Fairy Tale', cover: 'https://www.gutenberg.org/cache/epub/27200/pg27200.cover.medium.jpg', url: 'https://www.gutenberg.org/files/27200/27200-h/27200-h.htm' },
            { id: 'b23', title: 'White Fang', author: 'Jack London', category: 'Adventure', cover: 'https://www.gutenberg.org/cache/epub/910/pg910.cover.medium.jpg', url: 'https://www.gutenberg.org/files/910/910-h/910-h.htm' },
            { id: 'b24', title: 'Tom Sawyer', author: 'Mark Twain', category: 'Adventure', cover: 'https://www.gutenberg.org/cache/epub/74/pg74.cover.medium.jpg', url: 'https://www.gutenberg.org/files/74/74-h/74-h.htm' },
            { id: 'b25', title: 'Huckleberry Finn', author: 'Mark Twain', category: 'Adventure', cover: 'https://www.gutenberg.org/cache/epub/76/pg76.cover.medium.jpg', url: 'https://www.gutenberg.org/files/76/76-h/76-h.htm' },
            { id: 'b26', title: 'Robinson Crusoe', author: 'Daniel Defoe', category: 'Adventure', cover: 'https://www.gutenberg.org/cache/epub/521/pg521.cover.medium.jpg', url: 'https://www.gutenberg.org/files/521/521-h/521-h.htm' },
            { id: 'b27', title: 'Swiss Family Robinson', author: 'Johann David Wyss', category: 'Adventure', cover: 'https://www.gutenberg.org/cache/epub/3834/pg3834.cover.medium.jpg', url: 'https://www.gutenberg.org/files/3834/3834-h/3834-h.htm' },
            { id: 'b28', title: 'Pollyanna', author: 'Eleanor H. Porter', category: 'Story', cover: 'https://www.gutenberg.org/cache/epub/1450/pg1450.cover.medium.jpg', url: 'https://www.gutenberg.org/files/1450/1450-h/1450-h.htm' },
            { id: 'b29', title: 'The Little Lame Prince', author: 'Miss Mulock', category: 'Fantasy', cover: 'https://www.gutenberg.org/cache/epub/486/pg486.cover.medium.jpg', url: 'https://www.gutenberg.org/files/486/486-h/486-h.htm' },
            { id: 'b30', title: 'Beautiful Joe', author: 'Marshall Saunders', category: 'Story', cover: 'https://www.gutenberg.org/cache/epub/4491/pg4491.cover.medium.jpg', url: 'https://www.gutenberg.org/files/4491/4491-h/4491-h.htm' },
            { id: 'b31', title: 'Five Little Peppers', author: 'Margaret Sidney', category: 'Story', cover: 'https://www.gutenberg.org/cache/epub/2764/pg2764.cover.medium.jpg', url: 'https://www.gutenberg.org/files/2764/2764-h/2764-h.htm' },
            { id: 'b32', title: 'Tanglewood Tales', author: 'Nathaniel Hawthorne', category: 'Mythology', cover: 'https://www.gutenberg.org/cache/epub/1393/pg1393.cover.medium.jpg', url: 'https://www.gutenberg.org/files/1393/1393-h/1393-h.htm' },
            { id: 'b33', title: 'Just So Stories', author: 'Rudyard Kipling', category: 'Moral', cover: 'https://www.gutenberg.org/cache/epub/2781/pg2781.cover.medium.jpg', url: 'https://www.gutenberg.org/files/2781/2781-h/2781-h.htm' },
            { id: 'b34', title: 'The Blue Fairy Book', author: 'Andrew Lang', category: 'Fairy Tale', cover: 'https://www.gutenberg.org/cache/epub/503/pg503.cover.medium.jpg', url: 'https://www.gutenberg.org/files/503/503-h/503-h.htm' },
            { id: 'b35', title: 'The Story of My Life', author: 'Helen Keller', category: 'Biography', cover: 'https://www.gutenberg.org/cache/epub/1656/pg1656.cover.medium.jpg', url: 'https://www.gutenberg.org/files/1656/1656-h/1656-h.htm' },
            { id: 'b36', title: 'King Arthur', author: 'Howard Pyle', category: 'Adventure', cover: 'https://www.gutenberg.org/cache/epub/12753/pg12753.cover.medium.jpg', url: 'https://www.gutenberg.org/files/12753/12753-h/12753-h.htm' },
            { id: 'b37', title: 'Robin Hood', author: 'Howard Pyle', category: 'Adventure', cover: 'https://www.gutenberg.org/cache/epub/964/pg964.cover.medium.jpg', url: 'https://www.gutenberg.org/files/964/964-h/964-h.htm' },
            { id: 'b38', title: 'The Adventures of Pinocchio', author: 'Carlo Collodi', category: 'Adventure', cover: 'https://www.gutenberg.org/cache/epub/500/pg500.cover.medium.jpg', url: 'https://www.gutenberg.org/files/500/500-h/500-h.htm' },
            { id: 'b39', title: 'Daddy-Long-Legs', author: 'Jean Webster', category: 'Story', cover: 'https://www.gutenberg.org/cache/epub/139/pg139.cover.medium.jpg', url: 'https://www.gutenberg.org/files/139/139-h/139-h.htm' },
            { id: 'b40', title: 'At the Back of the North Wind', author: 'George MacDonald', category: 'Fantasy', cover: 'https://www.gutenberg.org/cache/epub/3382/pg3382.cover.medium.jpg', url: 'https://www.gutenberg.org/files/3382/3382-h/3382-h.htm' },
            { id: 'b41', title: 'The Princess and the Goblin', author: 'George MacDonald', category: 'Fantasy', cover: 'https://www.gutenberg.org/cache/epub/708/pg708.cover.medium.jpg', url: 'https://www.gutenberg.org/files/708/708-h/708-h.htm' },
            { id: 'b42', title: 'Rebecca of Sunnybrook Farm', author: 'Kate Douglas Wiggin', category: 'Story', cover: 'https://www.gutenberg.org/cache/epub/1645/pg1645.cover.medium.jpg', url: 'https://www.gutenberg.org/files/1645/1645-h/1645-h.htm' },
            { id: 'b43', title: 'The Voyages of Doctor Dolittle', author: 'Hugh Lofting', category: 'Fantasy', cover: 'https://www.gutenberg.org/cache/epub/1154/pg1154.cover.medium.jpg', url: 'https://www.gutenberg.org/files/1154/1154-h/1154-h.htm' },
            { id: 'b44', title: 'Story of Doctor Dolittle', author: 'Hugh Lofting', category: 'Fantasy', cover: 'https://www.gutenberg.org/cache/epub/501/pg501.cover.medium.jpg', url: 'https://www.gutenberg.org/files/501/501-h/501-h.htm' },
            { id: 'b45', title: 'Uncle Tom\'s Cabin', author: 'Harriet Beecher Stowe', category: 'Classic', cover: 'https://www.gutenberg.org/cache/epub/203/pg203.cover.medium.jpg', url: 'https://www.gutenberg.org/files/203/203-h/203-h.htm' },
            { id: 'b46', title: 'The Water-Babies', author: 'Charles Kingsley', category: 'Fantasy', cover: 'https://www.gutenberg.org/cache/epub/1018/pg1018.cover.medium.jpg', url: 'https://www.gutenberg.org/files/1018/1018-h/1018-h.htm' },
            { id: 'b47', title: 'A Little Princess', author: 'Frances Hodgson', category: 'Story', cover: 'https://www.gutenberg.org/cache/epub/146/pg146.cover.medium.jpg', url: 'https://www.gutenberg.org/files/146/146-h/146-h.htm' },
            { id: 'b48', title: 'Old Mother West Wind', author: 'Thornton W. Burgess', category: 'Story', cover: 'https://www.gutenberg.org/cache/epub/2413/pg2413.cover.medium.jpg', url: 'https://www.gutenberg.org/files/2413/2413-h/2413-h.htm' },
            { id: 'b49', title: 'The Adventures of Reddy Fox', author: 'Thornton W. Burgess', category: 'Story', cover: 'https://www.gutenberg.org/cache/epub/4172/pg4172.cover.medium.jpg', url: 'https://www.gutenberg.org/files/4172/4172-h/4172-h.htm' },
            { id: 'b50', title: 'The Merry Adventures of Robin Hood', author: 'Howard Pyle', category: 'Adventure', cover: 'https://www.gutenberg.org/cache/epub/10148/pg10148.cover.medium.jpg', url: 'https://www.gutenberg.org/files/10148/10148-h/10148-h.htm' }
        ],

        init() {
            this.renderLayout();
            this.renderBooks();
        },

        renderLayout() {
            mainContent.innerHTML = `
                <div class="min-h-screen bg-slate-50">
                    <div class="px-8 pt-10 pb-6 flex items-center justify-between">
                        <div class="space-y-1">
                            <h1 class="text-3xl font-black text-slate-800 tracking-tight">Wings Bookie</h1>
                            <div class="flex items-center gap-2">
                                <div class="relative flex h-2 w-2">
                                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </div>
                                <p class="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">50+ Free Books</p>
                            </div>
                        </div>
                        <div class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 border border-slate-50">
                            <i data-lucide="sparkles" class="text-yellow-400 w-6 h-6"></i>
                        </div>
                    </div>

                    <div id="booksGrid" class="px-6 grid grid-cols-2 gap-6 pb-32 animate-in fade-in slide-in-from-bottom-10 duration-1000"></div>

                    <div id="pdfViewer" class="fixed inset-0 bg-white z-[99999] hidden flex flex-col">
                        <div class="flex items-center justify-between p-6 bg-white shadow-sm">
                            <button onclick="window.Library.closeReader()" class="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center active:scale-90 transition-all">
                                <i data-lucide="chevron-left" class="w-6 h-6 text-indigo-900"></i>
                            </button>
                            <h2 id="readingTitle" class="text-sm font-black text-slate-800 uppercase tracking-tight truncate max-w-[200px]">Book Title</h2>
                            <div class="w-12"></div>
                        </div>
                        <div class="flex-1 relative">
                            <iframe id="pdfFrame" class="w-full h-full border-none" src=""></iframe>
                            <div id="loaderUI" class="absolute inset-0 flex flex-col items-center justify-center bg-white z-50">
                                <div class="w-10 h-10 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
                                <p class="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Preparing Book...</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            if (window.lucide) lucide.createIcons();
        },

        renderBooks() {
            const grid = document.getElementById('booksGrid');
            grid.innerHTML = this.books.map(book => `
                <div onclick="window.Library.openReader('${book.url}', '${book.title}')" 
                     class="group bg-white p-3 rounded-[40px] shadow-xl shadow-indigo-100/50 active:scale-95 transition-all duration-500">
                    <div class="aspect-[3/4] rounded-[32px] overflow-hidden mb-4 relative shadow-inner bg-slate-50">
                        <img src="${book.cover}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy">
                        <div class="absolute inset-0 bg-gradient-to-t from-indigo-900/40 to-transparent"></div>
                    </div>
                    <div class="px-2 pb-2">
                        <h4 class="text-[13px] font-black text-slate-800 leading-tight mb-1 truncate">${book.title}</h4>
                        <div class="flex items-center justify-between">
                            <span class="text-[9px] font-bold text-indigo-500 uppercase">${book.category}</span>
                            <div class="p-1.5 bg-indigo-50 rounded-lg">
                                <i data-lucide="book-open" class="w-3 h-3 text-indigo-600"></i>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
            if (window.lucide) lucide.createIcons();
        },

        openReader(url, title) {
            const viewer = document.getElementById('pdfViewer');
            const frame = document.getElementById('pdfFrame');
            const loader = document.getElementById('loaderUI');
            document.getElementById('readingTitle').innerText = title;
            
            viewer.classList.remove('hidden');
            loader.classList.remove('hidden');
            frame.src = url;
            frame.onload = () => loader.classList.add('hidden');
            document.body.style.overflow = 'hidden';
        },

        closeReader() {
            document.getElementById('pdfViewer').classList.add('hidden');
            document.getElementById('pdfFrame').src = "";
            document.body.style.overflow = '';
        }
    };

    window.Library = Library;
    Library.init();
})();