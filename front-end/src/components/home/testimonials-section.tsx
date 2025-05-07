import { FlipHorizontal } from "lucide-react";

export function TestimonialsSection() {
  return (
    <section className="py-20 px-5 relative" style={{ backgroundColor: '#F2F5DA' }}>
      <div className="max-w-5xl mx-auto relative h-[520px]">
        {/* Title */}
        <h2
          className="absolute text-6xl text-[#E48D44]"
          style={{
            top: '324px',
            left: '-80px',
            fontFamily: 'Anton, sans-serif',
          }}
        >
          What Our
          <br />
          Users Say
        </h2>

        {/* Sarah */}
        <div
          className="absolute p-6 text-white"
          style={{
            width: 548,
            height: 240,
            top: 0,
            left: -80,
            backgroundColor: '#86AB5D',
            borderRadius: '32px 0px 0px 32px',
            boxShadow: '0 3px 16px rgba(0, 0, 0, 0.1)',
          }}
        >
          <p className="mb-3 italic text-lg leading-relaxed">
            "NoteUS thực sự thay đổi cách mình học. Tính năng chat AI giúp mình hiểu sâu các chủ đề khó, còn mind map thì liên kết các ý tưởng lại với nhau cực kỳ trực quan. Tiết kiệm bao nhiêu thời gian ôn tập!"
          </p>
          <h4 className="text-lg font-bold">Nguyễn Minh Anh</h4>
          <p className="text-white/80 text-base">Sinh viên ngành Kinh tế</p>
        </div>

        {/* Emily */}
        <div
          className="absolute p-6 text-white"
          style={{
            width: 548,
            height: 240,
            top: 0,
            left: 496,
            backgroundColor: '#E48D44',
            borderRadius: '0px 32px 0px 0px',
            boxShadow: '0 3px 16px rgba(0, 0, 0, 0.1)',
          }}
        >
          <p className="italic text-lg leading-relaxed">
            "Là sinh viên IT, tài liệu mỗi môn nhiều kinh khủng. Nhờ NoteUS, mọi thứ được sắp xếp gọn gàng, dễ tìm. Mình có thể truy cập ghi chú mọi lúc mọi nơi, chuẩn bị cho đồ án hiệu quả hơn hẳn."
          </p>
          <h4 className="text-lg mt-1 font-bold">Trần Bảo Long</h4>
          <p className="text-white/80 text-base">Sinh viên ngành Khoa học máy tính</p>
        </div>

        {/* David */}
        <div
          className="absolute p-6 text-white"
          style={{
            width: 548,
            height: 240,
            top: 276,
            left: 496,
            backgroundColor: '#A2C579',
            borderRadius: '0px 0px 32px 32px',
            boxShadow: '0 3px 16px rgba(0, 0, 0, 0.1)',
          }}
        >
          <p className="italic text-lg leading-relaxed">
            "Mình hay dùng flashcard của NoteUS để học từ vựng tiếng Anh chuyên ngành và nhớ các công thức. Tính năng này thực sự hiệu quả để ghi nhớ thông tin, nhất là vào mùa thi cử."
          </p>
          <h4 className="text-lg mt-1 font-bold"> Lê Thị Thuỳ Trang</h4>
          <p className="text-white/80 text-base">Sinh viên ngành Ngôn ngữ Anh</p>
        </div>
      </div>
    </section>
  );
}
