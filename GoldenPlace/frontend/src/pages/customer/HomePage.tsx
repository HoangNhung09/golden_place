import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRooms } from '../../hooks/useRooms'
import { formatVND, getRoomPrimaryImage } from '../../lib/utils'

const offerMeta: Record<string, { discount: string; price?: number; image: string }> = {
  Standard: {
    discount: '- 6%',
    price: 850000,
    image: '/images/Phòng cao cấp( Hướng đông).png',
  },
  Deluxe: {
    discount: '- 17%',
    price: 750000,
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=900',
  },
  Suite: {
    discount: '- 8%',
    price: 550000,
    image: '/images/Phòng cao cấp( Hướng đông).png',
  },
  Family: {
    discount: '- 10%',
    image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=900',
  },
}

function offerRating(room: any, index: number) {
  const rating = Number(room.average_rating || 0)
  const count = Number(room.total_reviews || 0)
  if (rating > 0 && count > 0) {
    return { score: rating.toFixed(1), count }
  }
  return {
    score: [4.8, 4.7, 4.9][index % 3].toFixed(1),
    count: 24 + (Number(room.room_number || index) % 5) * 12,
  }
}

function priceText(amount: number) {
  return `${formatVND(amount).replace(/\s/g, '').replace('₫', 'đ')}/đêm`
}

export default function HomePage() {
  const { useGetRooms } = useRooms()
  const { data: roomsData, isLoading: isLoadingRooms } = useGetRooms({ limit: 100 })

  useEffect(() => {
    document.title = 'GoldenPlace Hotel'
  }, [])

  const offerRooms = [
    roomsData?.rooms?.find((room: any) => room.room_type?.name === 'Standard'),
    roomsData?.rooms?.find((room: any) => room.room_type?.name === 'Deluxe'),
    roomsData?.rooms?.find((room: any) => room.room_type?.name === 'Suite'),
  ].filter(Boolean) as any[]

  const fallbackOffers = ['Standard', 'Deluxe', 'Suite'].map((type, index) => ({
    id: `fallback-${type}`,
    room_number: `${index + 1}`,
    room_type: { name: type },
    base_price: offerMeta[type].price || [850000, 750000, 550000][index],
    images: [offerMeta[type].image],
  }))

  const offers = offerRooms.length >= 3 ? offerRooms.slice(0, 3) : fallbackOffers

  return (
    <div className="bg-white pb-0">
      <section className="relative h-[502px] w-full overflow-hidden">
        <img
          src="/images/div.relative.png"
          alt="Golden Place Resort"
          className="h-full w-full object-cover"
        />
        <button
          type="button"
          className="absolute left-[50px] top-1/2 hidden h-[60px] w-[60px] -translate-y-1/2 items-center justify-center rounded-full border border-white/70 text-white opacity-70 transition hover:bg-white/10 md:flex"
          aria-label="Ảnh trước"
        >
          <ChevronLeft className="h-9 w-9" strokeWidth={1.4} />
        </button>
        <button
          type="button"
          className="absolute right-[50px] top-1/2 hidden h-[60px] w-[60px] -translate-y-1/2 items-center justify-center rounded-full border border-white/70 text-white opacity-70 transition hover:bg-white/10 md:flex"
          aria-label="Ảnh tiếp theo"
        >
          <ChevronRight className="h-9 w-9" strokeWidth={1.4} />
        </button>
      </section>

      <section className="mx-auto grid max-w-[1170px] grid-cols-1 items-start gap-0 px-[15px] pt-[30px] md:grid-cols-2">
        <div className="px-[15px] pb-[15px] pt-[19px] text-center">
          <h1 className="mx-auto max-w-[400px] text-[32px] font-normal leading-10 text-[#323c3f]">
            Chào mừng đến với<br />khách sạn GOLDEN PLACE
          </h1>
          <div className="mx-auto mt-[29px] max-w-[535px] space-y-[14px] px-[10px] text-center text-[14px] font-medium leading-5 tracking-[0.1px] text-[#363636]">
            <p>
              Bắt đầu từ khát vọng định nghĩa lại chuẩn mực xa hoa tại Việt Nam, Golden Place Luxury Hotel không chỉ là một điểm dừng chân, mà là một biểu tượng của sự tinh tế. Chúng tôi tin rằng sự sang trọng thực sự nằm trong chất lượng phòng nghỉ, dịch vụ tận tâm và sự thấu hiểu nhu cầu của từng khách hàng.
            </p>
            <p>
              Sứ mệnh của chúng tôi là mang đến sự an tâm tuyệt đối và những kỷ niệm đáng nhớ thông qua dịch vụ cá nhân hóa, tôn vinh nét đẹp văn hóa địa phương kết hợp cùng tiêu chuẩn quốc tế.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-[30px] px-[15px]">
          <img
            src="/images/Alt demo.png"
            alt="Golden Place view"
            className="h-[394px] w-full object-cover"
          />
          <img
            src="/images/Alt demo-1.png"
            alt="Golden Place pool"
            className="h-[394px] w-full object-cover"
          />
        </div>
      </section>

      <section className="mx-auto max-w-[1170px] px-[15px] pb-[54px] pt-[54px]">
        <h2 className="text-center text-[32px] font-normal leading-10 text-[#363636]">Ưu đãi đặc biệt</h2>

        {isLoadingRooms ? (
          <div className="flex h-[330px] items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-[#00a680]" />
          </div>
        ) : (
          <div className="relative mt-[30px] grid grid-cols-1 gap-[30px] md:grid-cols-3">
            {offers.map((room: any, index: number) => {
              const typeName = room.room_type?.name || ['Standard', 'Deluxe', 'Suite'][index]
              const meta = offerMeta[typeName] || offerMeta.Standard
              const image = room.images?.length ? getRoomPrimaryImage(room.images) : meta.image
              const price = room.base_price || meta.price
              const rating = offerRating(room, index)
              const title = `Phòng ${room.room_number} - ${typeName}`

              return (
                <Link to={room.id?.startsWith?.('fallback') ? '/rooms' : `/rooms/${room.id}`} key={room.id} className="group block">
                  <article className="w-full overflow-hidden bg-white">
                    <div className="relative h-[239px] overflow-hidden bg-gray-100">
                      <img src={image} alt={title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />

                      <span className="absolute left-[15px] top-[15px] bg-[#ef6945] px-2 text-[13px] leading-[25px] text-white">
                        {meta.discount}
                      </span>

                      <span className="absolute bottom-0 right-0 bg-[#00a680] px-3 text-[22px] leading-[39px] text-white">
                        {priceText(price)}
                      </span>
                    </div>

                    <div className="pt-[15px]">
                      <div className="flex items-center gap-[14px]">
                        <span className="flex bg-[#f0c000] pl-[10px] text-[14px] leading-[27px] text-[#1a1b1b]">
                          Xuất sắc&nbsp;
                          <strong className="bg-[#ffdd53] px-[5px] font-normal">{rating.score}</strong>
                        </span>
                        <span className="text-[14px] leading-6 text-[#898989]">( {rating.count} đánh giá )</span>
                      </div>
                      <h3 className="mt-[10px] text-[16px] font-medium leading-6 tracking-[0.15px] text-[#333]">
                        {title}
                      </h3>
                    </div>
                  </article>
                </Link>
              )
            })}

            <button className="absolute left-0 top-[111px] hidden h-[26px] w-[26px] items-center justify-center border border-[#e1e1e1] bg-[#f5f5f5] text-[#333] opacity-60 md:flex">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="absolute right-0 top-[111px] hidden h-[26px] w-[26px] items-center justify-center border border-[#e1e1e1] bg-[#f5f5f5] text-[#333] md:flex">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
