"use server"

export interface ProductData {
  name: string
  description: string
  imageUrl: string
  price: number
}

export async function generateProductCard(
  productDescription: string,
  apiKey: string,
): Promise<{ success: boolean; data?: ProductData; error?: string }> {
  try {
    // Валидация API ключа
    if (!apiKey.startsWith("sk-")) {
      throw new Error("Неверный формат OpenAI API ключа. Ключ должен начинаться с 'sk-'")
    }

    let imageUrl = "/placeholder.svg?height=400&width=400"

    // Пытаемся сгенерировать изображение
    try {
      console.log("Attempting to generate image...")

      const imageResponse = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: `Professional product photography of ${productDescription}, high quality, clean background, commercial style, well lit, studio lighting`,
          size: "1024x1024",
          quality: "standard",
          n: 1,
        }),
      })

      if (imageResponse.ok) {
        const imageData = await imageResponse.json()
        if (imageData.data?.[0]?.url) {
          imageUrl = imageData.data[0].url
        }
      }
    } catch (imageError) {
      console.log("Image generation error:", imageError)
      // Продолжаем с placeholder изображением
    }

    // Генерируем описание продукта через прямой API вызов
    const descriptionResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: `Создай привлекательное маркетинговое описание для продукта: ${productDescription}. 
            Описание должно быть на русском языке, содержать 2-3 предложения, подчеркивать качество и привлекательность продукта.
            Верни только текст описания без дополнительных комментариев.`,
          },
        ],
        max_tokens: 150,
        temperature: 0.7,
      }),
    })

    if (!descriptionResponse.ok) {
      const errorData = await descriptionResponse.json().catch(() => ({}))
      throw new Error(`Text generation failed: ${errorData.error?.message || descriptionResponse.statusText}`)
    }

    const descriptionData = await descriptionResponse.json()
    const generatedText =
      descriptionData.choices?.[0]?.message?.content?.trim() || "Качественный продукт высокого класса"

    // Генерируем название продукта
    const nameResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: `Создай короткое привлекательное название для продукта: ${productDescription}. 
            Название должно быть на русском языке, максимум 3-4 слова.
            Верни только название без дополнительных комментариев.`,
          },
        ],
        max_tokens: 50,
        temperature: 0.7,
      }),
    })

    let productName = "Вкусный продукт" // Fallback название

    if (nameResponse.ok) {
      const nameData = await nameResponse.json()
      productName = nameData.choices?.[0]?.message?.content?.trim() || productName
    }

    // Генерируем случайную цену (от 500 до 5000 рублей)
    const price = Math.floor(Math.random() * (5000 - 500 + 1)) + 500

    return {
      success: true,
      data: {
        name: productName,
        description: generatedText,
        imageUrl,
        price,
      },
    }
  } catch (error) {
    console.error("Error generating product card:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Произошла ошибка при генерации карточки продукта",
    }
  }
}
