import { FlipHorizontal } from "lucide-react";

export function TestimonialsSection() {
  return (
    <section className="py-24 px-6 relative" style={{ backgroundColor: '#F2F5DA' }}>
      <div className="max-w-6xl mx-auto relative h-[980px]">
        {/* Title */}
        <h2 className="absolute text-8xl text-[#E48D44]" style={{ top: '405px', left: '-100px', fontFamily: 'Anton, sans-serif' }}>
          What Our
          <br />
          Users Say
        </h2>

        {/* Sarah */}
        <div
          className="absolute p-8 text-white"
          style={{
            width: 685,
            height: 300,
            top: 0,
            left: -100,
            backgroundColor: '#86AB5D',
            borderRadius: '40px 0px 0px 40px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          }}
        >
          <p className="mb-4 italic text-xl leading-relaxed">
            "NoteUS thực sự thay đổi cách mình học. Tính năng chat AI giúp mình hiểu sâu các chủ đề khó, còn mind map thì liên kết các ý tưởng lại với nhau cực kỳ trực quan. Tiết kiệm bao nhiêu thời gian ôn tập!"
          </p>
          <h4 className="text-xl font-bold">Nguyễn Minh Anh</h4>
          <p className="text-white/80 text-lg">Sinh viên ngành Kinh tế</p>
        </div>

        {/* Emily */}
        <div
          className="absolute p-8 text-white"
          style={{
            width: 685,
            height: 300,
            top: 0,
            left: 620,
            backgroundColor: '#E48D44',
            borderRadius: '0px 40px 0px 0px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          }}
        >
          <p className="italic text-xl leading-relaxed">
            "Là sinh viên IT, tài liệu mỗi môn nhiều kinh khủng. Nhờ NoteUS, mọi thứ được sắp xếp gọn gàng, dễ tìm. Mình có thể truy cập ghi chú mọi lúc mọi nơi, chuẩn bị cho đồ án hiệu quả hơn hẳn."
          </p>
          <h4 className="text-xl mt-2 font-bold">Trần Bảo Long</h4>
          <p className="text-white/80 text-lg">Sinh viên ngành Khoa học máy tính</p>
        </div>

        {/* David */}
        <div
          className="absolute p-8 text-white"
          style={{
            width: 685,
            height: 300,
            top: 345,
            left: 620,
            backgroundColor: '#A2C579',
            borderRadius: '0px 0px 40px 40px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          }}
        >
          <p className="italic text-xl leading-relaxed">
            "Mình hay dùng flashcard của NoteUS để học từ vựng tiếng Anh chuyên ngành và nhớ các công thức. Tính năng này thực sự hiệu quả để ghi nhớ thông tin, nhất là vào mùa thi cử."
          </p>
          <h4 className="text-xl mt-2 font-bold"> Lê Thị Thuỳ Trang</h4>
          <p className="text-white/80 text-lg">Sinh viên ngành Ngôn ngữ Anh</p>
        </div>

        {/* CTA */}
        <div className="absolute text-center w-full" style={{ top: '750px' }}>
          <h3 className="text-6xl mb-4" style={{ color: '#E48D44', fontFamily: 'Anton, sans-serif'}}>
            Ready to Transform Your Learning Experience?
          </h3>
          <p className="text-2xl text-gray-700 mb-6 max-w-xl mx-auto">
            Join thousands of students and professionals who are already using NoteUS to enhance their learning and productivity.
          </p>
          <button
            className="text-white font-semibold px-12 py-5 rounded-full transition shadow-md hover:shadow-lg text-xl"
            style={{ backgroundColor: '#86AB5D' }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#789E4E')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#86AB5D')}
          >
            GET STARTED
          </button>
        </div>
      </div>
    </section>
  );
}
