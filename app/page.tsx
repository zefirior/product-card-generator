"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Sparkles, ShoppingCart } from "lucide-react"
import { generateProductCard, type ProductData } from "./actions"

export default function ProductCardGenerator() {
  const [productDescription, setProductDescription] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [productData, setProductData] = useState<ProductData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!productDescription.trim() || !apiKey.trim()) {
      setError("Пожалуйста, заполните все поля")
      return
    }

    setIsGenerating(true)
    setError(null)
    setProductData(null)

    try {
      const result = await generateProductCard(productDescription, apiKey)

      if (result.success && result.data) {
        setProductData(result.data)
      } else {
        setError(result.error || "Произошла ошибка")
      }
    } catch (err) {
      setError("Произошла ошибка при генерации карточки")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <Sparkles className="text-purple-600" />
            Генератор карточек продуктов
          </h1>
          <p className="text-gray-600">Создавайте красивые карточки продуктов с помощью ИИ</p>
        </div>

        {/* Input Form */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Создать карточку продукта</CardTitle>
            <CardDescription>Введите описание продукта и ваш OpenAI API ключ для генерации</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Описание продукта</Label>
              <Textarea
                id="description"
                placeholder="Например: торт красный бархат, слоеное пирожное с кремом, шоколадный кекс..."
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKey">OpenAI API ключ</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="text-sm text-gray-500">
                Ваш API ключ используется только для этого запроса и не сохраняется
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !productDescription.trim() || !apiKey.trim()}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Генерируем карточку...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Сгенерировать карточку
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Product Card */}
        {productData && (
          <Card className="shadow-xl overflow-hidden">
            <div className="md:flex">
              {/* Product Image */}
              <div className="md:w-1/2 relative">
                <img
                  src={productData.imageUrl || "/placeholder.svg"}
                  alt={productData.name}
                  className="w-full h-64 md:h-full object-cover"
                />
                {productData.imageUrl.includes("placeholder.svg") && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="text-white text-center p-4">
                      <p className="text-sm">Изображение не удалось сгенерировать</p>
                      <p className="text-xs opacity-75">Используется заглушка</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="md:w-1/2 p-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{productData.name}</h2>
                    <p className="text-gray-600 leading-relaxed">{productData.description}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-purple-600">
                      {productData.price.toLocaleString("ru-RU")} ₽
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="ml-1 text-gray-600 text-sm">(4.8)</span>
                    </div>
                  </div>
                </div>

                <Button className="mt-6" size="lg">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Добавить в корзину
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
