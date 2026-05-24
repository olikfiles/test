export function Footer() {
  return (
    <footer id="contact" className="bg-foreground text-white py-20">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
        
        <div>
          <h2 className="font-display font-bold text-3xl mb-6">SYÖ & JUO</h2>
          <p className="text-gray-400 text-sm max-w-xs mx-auto md:mx-0 leading-relaxed">
            A Michelin-caliber dining experience, delivered to your table or ready for collection.
          </p>
        </div>

        <div>
          <h3 className="font-bold uppercase tracking-widest text-xs mb-6 text-gray-400">Find Us</h3>
          <p className="mb-2">Mannerheimintie 12</p>
          <p className="mb-2">00100 Helsinki</p>
          <p className="mt-6 font-bold">+358 40 123 4567</p>
          <p className="text-gray-400">hello@syojuo.fi</p>
        </div>

        <div>
          <h3 className="font-bold uppercase tracking-widest text-xs mb-6 text-gray-400">Hours</h3>
          <div className="space-y-2">
            <div className="flex justify-between md:justify-start md:gap-8 border-b border-gray-800 pb-2">
              <span className="text-gray-400">Mon - Thu</span>
              <span>17:00 - 23:00</span>
            </div>
            <div className="flex justify-between md:justify-start md:gap-8 border-b border-gray-800 pb-2">
              <span className="text-gray-400">Fri - Sat</span>
              <span>16:00 - 00:00</span>
            </div>
            <div className="flex justify-between md:justify-start md:gap-8 pb-2">
              <span className="text-gray-400">Sunday</span>
              <span>Closed</span>
            </div>
          </div>
        </div>

      </div>
      <div className="max-w-6xl mx-auto px-6 mt-20 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} SYÖ & JUO. All rights reserved.</p>
      </div>
    </footer>
  );
}
