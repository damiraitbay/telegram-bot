const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');


// Строка подключения к базе данных MongoDB Atlas
const dbURI = 'mongodb+srv://damir:qwerty123@cluster0.brkmijq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Подключение к базе данных
mongoose.connect(dbURI);

// Обработчик события подключения
mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB Atlas');
});

// Обработчик события ошибки подключения
mongoose.connection.on('error', (err) => {
    console.error('MongoDB Atlas connection error:', err);
});

// Обработчик события отключения от базы данных
mongoose.connection.on('disconnected', () => {
    console.log('Disconnected from MongoDB Atlas');
});

// Для гарантированного закрытия соединения при завершении работы приложения
process.on('SIGINT', () => {
    mongoose.connection.close(() => {
        console.log('MongoDB Atlas connection closed due to application termination');
        process.exit(0);
    });
});



const addressSchema = new mongoose.Schema({
    firstAddressText: String,
    secondAddressText: String,
    price: Number,
    phone: String,
});
const addressSchema1 = new mongoose.Schema({
    firstAddressText: String,
    secondAddressText: String,
    date: String,
    people: Number,
    price: Number,
    phone: String,
});
const addressSchema2 = new mongoose.Schema({
    firstAddressText: String,
    secondAddressText: String,
    type: String,
    price: Number,
    phone: String,
});
const addressSchema3 = new mongoose.Schema({
    driver_id: String,
    firstname: String,
    secondname: String,
    carModel: String,
    carNumber: String,
    phone: String,
    cardnumber: String,
});
const userSchema = new mongoose.Schema({
    user_number: { type: String, required: true },
    balance: { type: Number, default: 0 } // Баланс пользователя со значением по умолчанию 0
});

// Создание модели пользователя
const User = mongoose.model('User', userSchema);

// Функция для добавления баланса пользователя
// Функция для добавления баланса пользователя
let balance1 = ' ';
let user_number = ' ';
async function adding_balance(chatId) {
    try {
        // Отправляем сообщение с запросом ID пользователя
        await bot.sendMessage(chatId, 'Введите ID пользователя:');

        // Ожидаем ответ от пользователя
        const userNumberResponse = await waitForUserResponse(chatId);
        const userNumber = userNumberResponse.text;

        // Отправляем сообщение с запросом баланса
        await bot.sendMessage(chatId, 'Введите сумму для пополнения баланса:');

        // Ожидаем ответ от пользователя
        const amountResponse = await waitForUserResponse(chatId);
        const amount = parseFloat(amountResponse.text);

        // Находим пользователя в базе данных
        let user = await User.findOne({ user_number: userNumber });

        // Если пользователя не найдено, создаем нового пользователя с указанным ID
        if (!user) {
            user = new User({
                user_number: userNumber,
                balance: 0
            });
        }

        // Добавляем к текущему балансу пользователя новое значение
        user.balance += amount;
        balance1 = user.balance;
        user_number = userNumber;
        console.log(userNumber);
        // Сохраняем изменения в базе данных
        await user.save();

        await bot.sendMessage(chatId, `Баланс пользователя успешно обновлен. Текущий баланс: ${user.balance}`);
    } catch (error) {
        console.error('Произошла ошибка при добавлении баланса:', error);
        await bot.sendMessage(chatId, 'Произошла ошибка при добавлении баланса.');
    }
}

const Address = mongoose.model('Address', addressSchema);
const AddressForCity = mongoose.model('AddressForCity', addressSchema1);
const AddressForDelivery = mongoose.model('AddressForDelivery', addressSchema2);
const taxiDates = mongoose.model('taxiDates', addressSchema3);


// Указываем токен, который выдал вам BotFather
const token = '7058257956:AAGn-P8WiplGNtPhG-j3cVIXCHCAbIpaCZw';

// Создаем экземпляр бота
const bot = new TelegramBot(token, { polling: true });

// Обработчик выбора региона
let regionSelected = false;

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const messageText = msg.text;
    // Если сообщение - команда /start и регион еще не выбран
    if (messageText === '/start') {
        sendButtonsForRegion1(chatId);
    }
});


// Функция отправки кнопок для Региона 1
function sendButtonsForRegion1(chatId) {
    const keyboard = {
        reply_markup: {
            keyboard: [
                ['Баланс толтыру'],
                ['Такси шақыру'],
                ['Жеткізу(Доставка)'],
                ['Қызылордаға такси'],
                ['Азық-түлікке тапсырыс'],
                ['Дәріханалар'],
                ['Гүлдер'],
                ['Такси болу'],

            ],
            resize_keyboard: true,
            one_time_keyboard: true
        }
    };

    bot.sendMessage(chatId, 'Салем! Сізге қандай қызмет көрсете аламын?', keyboard);
}
const commands = [
    { command: "start", description: "Мәзір" },
    { command: "taxi", description: "Такси шақыру" },
    { command: "partner", description: "Серіктес болу" },
];

bot.setMyCommands(commands).then(() => {
    console.log('Команды бота успешно обновлены');
}).catch((error) => {
    console.error('Ошибка обновления команд бота:', error);
});
let isKyzylordaRequest = false;
async function handleTaxiForQyzylordaRequest(chatId) {
    const chat = await bot.getChat(chatId);
    const firstname = chat.first_name;
    await bot.sendMessage(chatId, 'Шығатын мекен-жайыңыз?');
    const firstMessage = await waitForUserResponse(chatId);
    await bot.sendMessage(chatId, 'Баратын мекен-жайыңыз?');
    const secondMessage = await waitForUserResponse(chatId);
    await bot.sendMessage(chatId, 'Қай уақытқа? (күні/уақыты)');
    const date = await waitForUserResponse(chatId);
    const peopleOptions = {
        reply_markup: {
            keyboard: [
                [{ text: '1' }, { text: '2' }, { text: '3' }, { text: '4' }]
            ]
        }
    }
    await bot.sendMessage(chatId, 'Қанша адам мінесіздер?', peopleOptions);
    const people = await waitForUserResponse(chatId);
    const priceOptions = {
        reply_markup: {
            keyboard: [
                [{ text: '350' }, { text: '400' }, { text: '450' }],
                [{ text: '500' }, { text: '550' }, { text: '600' }, ],
                [{ text: '700' }, { text: '800' }, { text: '1000' }, ],
                [{ text: '1500' }, { text: '2000' }, { text: '5000' }, ],
                [{ text: '6000' }, { text: '8000' }, { text: '10000' }, ]
            ],
            resize_keyboard: true,
            one_time_keyboard: true
        }
    };
    await bot.sendMessage(chatId, 'Ұсынатын бағаңыз (₸)? Бағаны сан ретінде төменде жазсаңыз болады.', priceOptions);
    const price = await waitForUserResponse(chatId);
    const contactRequest = {
        reply_markup: {
            keyboard: [
                [{ text: '📱 Телефон номер жіберу', request_contact: true }]
            ],
            resize_keyboard: true,
            one_time_keyboard: true
        }
    };

    await bot.sendMessage(chatId, 'Телефон номеріңіз?', contactRequest);
    const phone = await waitForUserResponse(chatId);


    bot.onText(/🌎 Шығaтын мекен-жай./, async(msg) => {
        const chatId = msg.chat.id;
        await bot.sendMessage(chatId, 'Шығатын мекен-жайыңыз?');
        bot.once('text', async(addressMsg) => {
            const newAddress = addressMsg.text;
            firstMessage.text = newAddress;
            try {
                await Address.findOneAndUpdate({}, { firstAddressText: firstMessage.text });
                console.log(firstMessage.text);
                await bot.sendMessage(chatId, `Тапсырысты жіберу үшін <b>растау қажет</b> \n\n<b>Қайдан:</b> ${firstMessage.text} \n<b>Қайда:</b> ${secondMessage.text} \n<b>Уақыты:</b> ${date.text} \n<b>Жолаушылар саны:</b> ${people.text} \n<b>Бағасы:</b> ${price.text} ₸ \n<b>Телефон:</b> ${phoneText} \n\nТапсырысты растау үшін \n- ✅ <b>Тапсырысты жіберу</b> батырмасын таңдау қажет`, { parse_mode: "HTML", ...keyboard });
            } catch (error) {
                console.error('Ошибка при обновлении адреса:', error);
                await bot.sendMessage(chatId, 'Произошла ошибка при изменении адреса.');
            }


        });


    });

    bot.onText(/🌎 Баратын мекен-жай./, async(msg) => {
        const chatId = msg.chat.id;
        await bot.sendMessage(chatId, 'Баратын мекен-жайыңыз?');
        bot.once('text', async(addressMsg) => {
            const newAddress = addressMsg.text;
            secondMessage.text = newAddress;
            try {
                await AddressForCity.findOneAndUpdate({}, { secondAddressText: secondMessage.text });
                console.log(secondMessage.text);
                await bot.sendMessage(chatId, `Тапсырысты жіберу үшін <b>растау қажет</b> \n\n<b>Қайдан:</b> ${firstMessage.text} \n<b>Қайда:</b> ${secondMessage.text} \n<b>Уақыты:</b> ${date.text} \n<b>Жолаушылар саны:</b> ${people.text} \n<b>Бағасы:</b> ${price.text} ₸ \n<b>Телефон:</b> ${phoneText} \n\nТапсырысты растау үшін \n- ✅ <b>Тапсырысты жіберу</b> батырмасын таңдау қажет`, { parse_mode: "HTML", ...keyboard });
            } catch (error) {
                console.error('Ошибка при обновлении адреса:', error);
                await bot.sendMessage(chatId, 'Произошла ошибка при изменении адреса.');
            }
        });
    });
    bot.onText(/⏰ Уақыт./, async(msg) => {
        const chatId = msg.chat.id;
        await bot.sendMessage(chatId, 'Қай уақытқа? (күні/уақыты)');
        bot.once('text', async(addressMsg) => {
            const newDate = addressMsg.text;
            date.text = newDate;
            try {
                await AddressForCity.findOneAndUpdate({}, { date: date.text });
                console.log(date.text);
                await bot.sendMessage(chatId, `Тапсырысты жіберу үшін <b>растау қажет</b> \n\n<b>Қайдан:</b> ${firstMessage.text} \n<b>Қайда:</b> ${secondMessage.text} \n<b>Уақыты:</b> ${date.text} \n<b>Жолаушылар саны:</b> ${people.text} \n<b>Бағасы:</b> ${price.text} ₸ \n<b>Телефон:</b> ${phoneText} \n\nТапсырысты растау үшін \n- ✅ <b>Тапсырысты жіберу</b> батырмасын таңдау қажет`, { parse_mode: "HTML", ...keyboard });
            } catch (error) {
                console.error('Ошибка при обновлении адреса:', error);
                await bot.sendMessage(chatId, 'Произошла ошибка при изменении адреса.');
            }
        });
    });
    bot.onText(/👤 Жолаушылар саны./, async(msg) => {
        const chatId = msg.chat.id;
        await bot.sendMessage(chatId, 'Қанша адам мінесіздер?', peopleOptions);
        bot.once('text', async(addressMsg) => {
            const newPeople = addressMsg.text;
            people.text = newPeople;
            try {
                await Address.findOneAndUpdate({}, { people: people.text });
                console.log(people.text);
                await bot.sendMessage(chatId, `Тапсырысты жіберу үшін <b>растау қажет</b> \n\n<b>Қайдан:</b> ${firstMessage.text} \n<b>Қайда:</b> ${secondMessage.text} \n<b>Уақыты:</b> ${date.text} \n<b>Жолаушылар саны:</b> ${people.text} \n<b>Бағасы:</b> ${price.text} ₸ \n<b>Телефон:</b> ${phoneText} \n\nТапсырысты растау үшін \n- ✅ <b>Тапсырысты жіберу</b> батырмасын таңдау қажет`, { parse_mode: "HTML", ...keyboard });
            } catch (error) {
                console.error('Ошибка при обновлении адреса:', error);
                await bot.sendMessage(chatId, 'Произошла ошибка при изменении адреса.');
            }
        });
    });

    bot.onText(/💵 Жол ақысы./, async(msg) => {
        const chatId = msg.chat.id;
        await bot.sendMessage(chatId, 'Ұсынатын бағаңыз (₸)? Бағаны сан ретінде төменде жазсаңыз болады.', priceOptions);
        bot.once('text', async(addressMsg) => {
            const newPrice = addressMsg.text;
            price.text = newPrice;
            try {
                await Address.findOneAndUpdate({}, { price: price.text });
                console.log(price.text);
                await bot.sendMessage(chatId, `Тапсырысты жіберу үшін <b>растау қажет</b> \n\n<b>Қайдан:</b> ${firstMessage.text} \n<b>Қайда:</b> ${secondMessage.text} \n<b>Уақыты:</b> ${date.text} \n<b>Жолаушылар саны:</b> ${people.text} \n<b>Бағасы:</b> ${price.text} ₸ \n<b>Телефон:</b> ${phoneText} \n\nТапсырысты растау үшін \n- ✅ <b>Тапсырысты жіберу</b> батырмасын таңдау қажет`, { parse_mode: "HTML", ...keyboard });
            } catch (error) {
                console.error('Ошибка при обновлении адреса:', error);
                await bot.sendMessage(chatId, 'Произошла ошибка при изменении адреса.');
            }
        });
    });


    bot.onText(/📱 Телефон номер./, async(msg) => {
        const chatId = msg.chat.id;
        await bot.sendMessage(chatId, 'Телефон номеріңіз?', contactRequest);

        bot.once('contact', async(contactMsg) => {
            const chatId = contactMsg.chat.id;
            if (contactMsg.text !== 'Телефон номеріңіз?') {
                const newPhoneFromContact = contactMsg.contact.phone_number;
                phoneText = newPhoneFromContact;
                try {
                    await Address.findOneAndUpdate({}, { phone: phoneText });
                    await bot.sendMessage(chatId, `Тапсырысты жіберу үшін <b>растау қажет</b> \n\n<b>Қайдан:</b> ${firstMessage.text} \n<b>Қайда:</b> ${secondMessage.text} \n<b>Уақыты:</b> ${date.text} \n<b>Жолаушылар саны:</b> ${people.text} \n<b>Бағасы:</b> ${price.text} ₸ \n<b>Телефон:</b> ${phoneText} \n\nТапсырысты растау үшін \n- ✅ <b>Тапсырысты жіберу</b> батырмасын таңдау қажет`, { parse_mode: "HTML", ...keyboard });
                } catch (error) {
                    console.error('Ошибка при обновлении номера телефона:', error);
                    await bot.sendMessage(chatId, 'Произошла ошибка при изменении номера телефона.');
                }
            }
        });

        bot.once('text', async(textMsg) => {
            const chatId = textMsg.chat.id;

            if (textMsg.text !== 'Телефон номеріңіз?' && textMsg.text.length === 11) {
                const newPhoneFromText = textMsg.text;
                phoneText = newPhoneFromText;
                try {
                    await Address.findOneAndUpdate({}, { phone: phoneText });
                    await bot.sendMessage(chatId, `Тапсырысты жіберу үшін <b>растау қажет</b> \n\n<b>Қайдан:</b> ${firstMessage.text} \n<b>Қайда:</b> ${secondMessage.text} \n<b>Уақыты:</b> ${date.text} \n<b>Жолаушылар саны:</b> ${people.text} \n<b>Бағасы:</b> ${price.text} ₸ \n<b>Телефон:</b> ${phoneText} \n\nТапсырысты растау үшін \n- ✅ <b>Тапсырысты жіберу</b> батырмасын таңдау қажет`, { parse_mode: "HTML", ...keyboard });
                } catch (error) {
                    console.error('Ошибка при обновлении номера телефона:', error);
                    await bot.sendMessage(chatId, 'Произошла ошибка при изменении номера телефона.');
                }
            }
        });

    });

    phoneText = phone.contact ? phone.contact.phone_number.toString() : (phone.text && phone.text.length === 11 ? phone.text : '');
    const addressesForCity = new AddressForCity({
        firstAddressText: firstMessage.text,
        secondAddressText: secondMessage.text,
        date: date.text,
        people: people.text,
        price: price.text,
        phone: phoneText,

    });



    const savedAddress = await addressesForCity.save();
    savedAddressId = savedAddress._id;
    console.log(savedAddress);
    const keyboard = {
        reply_markup: {
            keyboard: [
                [{ text: '✅ Тапсырысты жіберу' }],
                [{ text: '🖊 Өзгеріс енгізу' }],
                [{ text: '❌ Тапсырысты жою' }]
            ],
            resize_keyboard: true,
            one_time_keyboard: true
        }
    };
    await bot.sendMessage(chatId, `Тапсырысты жіберу үшін <b>растау қажет</b> \n\n<b>Қайдан:</b> ${firstMessage.text} \n<b>Қайда:</b> ${secondMessage.text} \n<b>Уақыты:</b> ${date.text} \n<b>Жолаушылар саны:</b> ${people.text} \n<b>Бағасы:</b> ${price.text} ₸ \n<b>Телефон:</b> ${phoneText} \n\nТапсырысты растау үшін \n- ✅ <b>Тапсырысты жіберу</b> батырмасын таңдау қажет`, { parse_mode: "HTML", ...keyboard });
    forwardmessage = `<b>---ЖАҢА ТАПСЫРЫС---</b> \n\n<b>Қайдан:</b> ${firstMessage.text} \n<b>Қайда:</b> ${secondMessage.text} \n<b>Қосымша ақпарат:</b> ${date.text} \n<b>Жолаушылар саны:</b> ${people.text} \n\n<b>Тапсырыс типі: Қызылордаға такси</b> \n<b>Бағасы:</b> ${price.text} ₸ \n<b>Телефон:</b>`;
    destination_message = `<b>${firstname} сіздің тапсырысыңыз қабылданды.</b>
    \n<b>Тапсырыс №</b> ${chatId}
\n<b>Қайдан:</b> ${firstMessage.text}
<b>Қайда:</b> ${secondMessage.text}
<b>Уақыты:</b> ${date.text} 
<b>Жолаушылар саны:</b> ${people.text} 
<b>Бағасы:</b> ${price.text} ₸`;
    client_phone = phoneText;
    order_price = price.text;
}
async function handleTaxiRequest(chatId) {
    const chat = await bot.getChat(chatId);
    const firstname = chat.first_name;
    await bot.sendMessage(chatId, 'Шығатын мекен-жайыңыз?');
    const firstMessage = await waitForUserResponse(chatId);
    await bot.sendMessage(chatId, 'Баратын мекен-жайыңыз?');
    const secondMessage = await waitForUserResponse(chatId);
    const priceOptions = {
        reply_markup: {
            keyboard: [
                [{ text: '350' }, { text: '400' }, { text: '450' }],
                [{ text: '500' }, { text: '550' }, { text: '600' }, ],
                [{ text: '700' }, { text: '800' }, { text: '1000' }, ],
                [{ text: '1500' }, { text: '2000' }, { text: '5000' }, ],
                [{ text: '6000' }, { text: '8000' }, { text: '10000' }, ]
            ],
            resize_keyboard: true,
            one_time_keyboard: true
        }
    };
    await bot.sendMessage(chatId, 'Ұсынатын бағаңыз (₸)? Бағаны сан ретінде төменде жазсаңыз болады.', priceOptions);
    const price = await waitForUserResponse(chatId);
    const contactRequest = {
        reply_markup: {
            keyboard: [
                [{ text: '📱 Телефон номер жіберу', request_contact: true }]
            ],
            resize_keyboard: true,
            one_time_keyboard: true
        }
    };

    await bot.sendMessage(chatId, 'Телефон номеріңіз?', contactRequest);
    const phone = await waitForUserResponse(chatId);


    bot.onText(/🌎 Шығатын мекен-жай/, async(msg) => {
        const chatId = msg.chat.id;
        await bot.sendMessage(chatId, 'Шығатын мекен-жайыңыз?');
        bot.once('text', async(addressMsg) => {
            const newAddress = addressMsg.text;
            firstMessage.text = newAddress;
            try {
                await Address.findOneAndUpdate({}, { firstAddressText: firstMessage.text });
                console.log(firstMessage.text);
                await bot.sendMessage(chatId, `Тапсырысты жіберу үшін <b>растау қажет</b> \n\n<b>Қайдан:</b> ${firstMessage.text} \n<b>Қайда:</b> ${secondMessage.text} \n<b>Бағасы:</b> ${price.text} ₸ \n<b>Телефон:</b> ${phoneText} \n\nТапсырысты растау үшін \n- ✅ <b>Тапсырысты жіберу</b> батырмасын таңдау қажет`, { parse_mode: "HTML", ...keyboard });
            } catch (error) {
                console.error('Ошибка при обновлении адреса:', error);
                await bot.sendMessage(chatId, 'Произошла ошибка при изменении адреса.');
            }


        });


    });

    bot.onText(/🌎 Баратын мекен-жай/, async(msg) => {
        const chatId = msg.chat.id;
        await bot.sendMessage(chatId, 'Баратын мекен-жайыңыз?');
        bot.once('text', async(addressMsg) => {
            const newAddress = addressMsg.text;
            secondMessage.text = newAddress;
            try {
                await Address.findOneAndUpdate({}, { secondAddressText: secondMessage.text });
                console.log(secondMessage.text);
                await bot.sendMessage(chatId, `Тапсырысты жіберу үшін <b>растау қажет</b> \n\n<b>Қайдан:</b> ${firstMessage.text} \n<b>Қайда:</b> ${secondMessage.text} \n<b>Бағасы:</b> ${price.text} ₸ \n<b>Телефон:</b> ${phoneText} \n\nТапсырысты растау үшін \n- ✅ <b>Тапсырысты жіберу</b> батырмасын таңдау қажет`, { parse_mode: "HTML", ...keyboard });
            } catch (error) {
                console.error('Ошибка при обновлении адреса:', error);
                await bot.sendMessage(chatId, 'Произошла ошибка при изменении адреса.');
            }
        });
    });


    bot.onText(/💵 Жол ақысы/, async(msg) => {
        const chatId = msg.chat.id;
        await bot.sendMessage(chatId, 'Ұсынатын бағаңыз (₸)? Бағаны сан ретінде төменде жазсаңыз болады.', priceOptions);
        bot.once('text', async(addressMsg) => {
            const newPrice = addressMsg.text;
            price.text = newPrice;
            try {
                await Address.findOneAndUpdate({}, { price: price.text });
                console.log(price.text);
                await bot.sendMessage(chatId, `Тапсырысты жіберу үшін <b>растау қажет</b> \n\n<b>Қайдан:</b> ${firstMessage.text} \n<b>Қайда:</b> ${secondMessage.text} \n<b>Бағасы:</b> ${price.text} ₸ \n<b>Телефон:</b> ${phoneText} \n\nТапсырысты растау үшін \n- ✅ <b>Тапсырысты жіберу</b> батырмасын таңдау қажет`, { parse_mode: "HTML", ...keyboard });
            } catch (error) {
                console.error('Ошибка при обновлении адреса:', error);
                await bot.sendMessage(chatId, 'Произошла ошибка при изменении адреса.');
            }
        });
    });


    bot.onText(/📱 Телефон номер/, async(msg) => {
        const chatId = msg.chat.id;
        await bot.sendMessage(chatId, 'Телефон номеріңіз?', contactRequest);

        bot.once('contact', async(contactMsg) => {
            const chatId = contactMsg.chat.id;
            if (contactMsg.text !== 'Телефон номеріңіз?') {
                const newPhoneFromContact = contactMsg.contact.phone_number;
                phoneText = newPhoneFromContact;
                try {
                    await Address.findOneAndUpdate({}, { phone: phoneText });
                    await bot.sendMessage(chatId, `Тапсырысты жіберу үшін <b>растау қажет</b> \n\n<b>Қайдан:</b> ${firstMessage.text} \n<b>Қайда:</b> ${secondMessage.text} \n<b>Бағасы:</b> ${price.text} ₸ \n<b>Телефон:</b> ${phoneText} \n\nТапсырысты растау үшін \n- ✅ <b>Тапсырысты жіберу</b> батырмасын таңдау қажет`, { parse_mode: "HTML", ...keyboard });
                } catch (error) {
                    console.error('Ошибка при обновлении номера телефона:', error);
                    await bot.sendMessage(chatId, 'Произошла ошибка при изменении номера телефона.');
                }
            }
        });

        bot.once('text', async(textMsg) => {
            const chatId = textMsg.chat.id;

            if (textMsg.text !== 'Телефон номеріңіз?' && textMsg.text.length === 11) {
                const newPhoneFromText = textMsg.text;
                phoneText = newPhoneFromText;
                try {
                    await Address.findOneAndUpdate({}, { phone: phoneText });
                    await bot.sendMessage(chatId, `Тапсырысты жіберу үшін <b>растау қажет</b> \n\n<b>Қайдан:</b> ${firstMessage.text} \n<b>Қайда:</b> ${secondMessage.text} \n<b>Бағасы:</b> ${price.text} ₸ \n<b>Телефон:</b> ${phoneText} \n\nТапсырысты растау үшін \n- ✅ <b>Тапсырысты жіберу</b> батырмасын таңдау қажет`, { parse_mode: "HTML", ...keyboard });
                } catch (error) {
                    console.error('Ошибка при обновлении номера телефона:', error);
                    await bot.sendMessage(chatId, 'Произошла ошибка при изменении номера телефона.');
                }
            }
        });

    });

    phoneText = phone.contact ? phone.contact.phone_number.toString() : (phone.text && phone.text.length === 11 ? phone.text : '');
    const addresses = new Address({
        firstAddressText: firstMessage.text,
        secondAddressText: secondMessage.text,
        price: price.text,
        phone: phoneText,

    });



    const savedAddress = await addresses.save();
    savedAddressId = savedAddress._id;
    console.log(savedAddress);
    const keyboard = {
        reply_markup: {
            keyboard: [
                [{ text: '✅ Тапсырысты жіберу' }],
                [{ text: '🖊 Өзгеріc енгізу' }],
                [{ text: '❌ Тапсырысты жою' }]
            ],
            resize_keyboard: true,
            one_time_keyboard: true
        }
    };
    await bot.sendMessage(chatId, `Тапсырысты жіберу үшін <b>растау қажет</b> \n\n<b>Қайдан:</b> ${firstMessage.text} \n<b>Қайда:</b> ${secondMessage.text}  \n<b>Бағасы:</b> ${price.text} ₸ \n<b>Телефон:</b> ${phoneText} \n\nТапсырысты растау үшін \n- ✅ <b>Тапсырысты жіберу</b> батырмасын таңдау қажет`, { parse_mode: "HTML", ...keyboard });
    forwardmessage = `<b>---ЖАҢА ТАПСЫРЫС---</b> \n\n<b>Қайдан:</b> ${firstMessage.text} \n<b>Қайда:</b> ${secondMessage.text} \n<b>Бағасы:</b> ${price.text} ₸ \n<b>Телефон:</b>`;
    destination_message = `<b>${firstname} сіздің тапсырысыңыз қабылданды.</b>
    \n<b>Тапсырыс №</b> ${chatId}
    \n<b>Тапсырыс типі: Қызылордаға такси</b>
\n<b>Қайдан:</b> ${firstMessage.text}
<b>Қайда:</b> ${secondMessage.text}
<b>Бағасы:</b> ${price.text} ₸`;
    client_phone = phoneText;
    order_price = price.text;
}
let isPartnerRequest = false;

async function handlePartnerRequest(chatId) {
    let driver = await taxiDates.findOne({ driver_id: String(chatId).substring(0, 5) });

    const keyboard = {
        reply_markup: {
            keyboard: [
                [{ text: '✅ Өтінімді растау' }],
                [{ text: '🖊 Өзгеpіс енгізу' }],
                [{ text: '❌ Өтінімді жою' }]
            ],
            resize_keyboard: true,
            one_time_keyboard: true
        }
    };
    const contactRequest = {
        reply_markup: {
            keyboard: [
                [{ text: '📱 Телефон номер жіберу', request_contact: true }]
            ],
            resize_keyboard: true,
            one_time_keyboard: true
        }
    };

    if (!driver) {
        await bot.sendMessage(chatId, 'Есіміңіз:');
        const firstnameText = await waitForUserResponse(chatId);
        await bot.sendMessage(chatId, 'Тегіңізді жазыңыз:');
        const secondnameText = await waitForUserResponse(chatId);
        await bot.sendMessage(chatId, 'Телефон номеріңіз?', contactRequest);
        const phone = await waitForUserResponse(chatId);
        await bot.sendMessage(chatId, 'Kaspi Gold-тағы телефон номеріңіз? (Төлем үшін), (Мыс. 87054651125)');
        const cardNumber = await waitForUserResponse(chatId);
        await bot.sendMessage(chatId, 'Көлігіңіздің моделі қандай? (Мыс. Тойота 40 қара түсті)');
        const carModel = await waitForUserResponse(chatId);
        await bot.sendMessage(chatId, 'Көлігіңіздің номерін жазыңыз. (Мыс. 156-AFT)');
        const carNumberText = await waitForUserResponse(chatId); // Переименовано в carNumberText
        phoneText = phone.contact ? phone.contact.phone_number.toString() : (phone.text && phone.text.length === 11 ? phone.text : '');
        driver = new taxiDates({
            driver_id: String(chatId).substring(0, 5),
            firstname: firstnameText.text,
            secondname: secondnameText.text,
            carModel: carModel.text,
            carNumber: carNumberText.text, // Используем carNumberText вместо carNumber
            phone: phoneText,
            cardnumber: cardNumber.text,
        });
        const savedAddress = await driver.save();
        savedAddressId = savedAddress._id;

        await bot.sendMessage(chatId, `<b>Өтінімді</b> растаңыз 
    \n<b>Есімі:</b> ${firstnameText.text}
<b>Тегі:</b> ${secondnameText.text} 
<b>Көлік моделі:</b> ${carModel.text}
<b>Көлік номері:</b> ${carNumberText.text}  
<b>Телефон:</b> ${ phoneText }
<b>Kaspi Gold:</b> ${cardNumber.text} 
    \nӨтінімді растау үшін 
    - ✅ <b>Өтінімді растау</b> батырмасын таңдау қажет `, { parse_mode: "HTML", ...keyboard });
        contract = `<b>Келісімшарт</b> №${chatId} 
    \nЖК "Жалағаш Такси" және ${secondnameText.text} ${firstnameText.text} (арықарай Серіктес) арасындаға келісімшарт.
    \n<b>Тапсырыстар чатына тіркелу арқылы </b>, сіз келесі бекітілген шарттарға өз келісіміңізді бересіз:  
-Жеке мәліметтеріңізді өңдеуге және сақтауға 
-Әр қабылдаған тапсырысыңыздан 10 % комиссия алынуына 
-2000₸ жоғары тапсырыстарға комиссия көлемі 5 % құрайды
\n<b>Чатқа тіркелгеннен кейін</b>, бірден тапсырыстарды қабылдай аласыз: 
-Балансыңызда жеткілікті дәрежеде тапсырыстан алатын <b>комиссия соммасы</b> болуы керек 
-Балансыңызды толтыру үшін басты мәзірдегі <b>Баланс толтыру</b> батырмасына өту қажет
\nКелесі көрсетілген талаптарды орындамасаңыз, <b>келісімшарт біржақты бұзылады:</b> 
-Тапсырысты қабылдағаннан кейін клиентке кешігіп бару 
-Қабылдаған тапсырысқа бармасаңыз 
-Клиенттен тапсырыста көрсетілген бағадан артық сұрағанда 
-Клиентке дөреке сөйлесеңіз 
-Көлік ішінде артық адам болса 
-Басқа жүргізуші қабылдаған тапсырысқа барсаңыз 
-Көлігіңіздің іші лас болса
\nСеріктесте патент болуы керек.Егер патент болмаған жағдайда, жауапкершілікті Серіктес <b>өзіне алады.</b>
\nЕңгізілген мәліметтердің растығына Серіктес <b>кепілдік береді.</b>
\n<b>Назар аударыңыз!</b> Тапсырыстар чатына тіркелу арқылы келісімшартқа өз келісіміңізді бересіз 
<b>Уақыты:</b> ${new Date().toLocaleString()}`

    } else if (driver) {
        contract = `<b>Келісімшарт</b> №${chatId} 
        \nЖК "Жалағаш Такси" және ${driver.secondname} ${driver.firstname} (арықарай Серіктес) арасындаға келісімшарт.
        \n<b>Тапсырыстар чатына тіркелу арқылы </b>, сіз келесі бекітілген шарттарға өз келісіміңізді бересіз:  
    -Жеке мәліметтеріңізді өңдеуге және сақтауға 
    -Әр қабылдаған тапсырысыңыздан 10 % комиссия алынуына 
    -2000₸ жоғары тапсырыстарға комиссия көлемі 5 % құрайды
    \n<b>Чатқа тіркелгеннен кейін</b>, бірден тапсырыстарды қабылдай аласыз: 
    -Балансыңызда жеткілікті дәрежеде тапсырыстан алатын <b>комиссия соммасы</b> болуы керек 
    -Балансыңызды толтыру үшін басты мәзірдегі <b>Баланс толтыру</b> батырмасына өту қажет
    \nКелесі көрсетілген талаптарды орындамасаңыз, <b>келісімшарт біржақты бұзылады:</b> 
    -Тапсырысты қабылдағаннан кейін клиентке кешігіп бару 
    -Қабылдаған тапсырысқа бармасаңыз 
    -Клиенттен тапсырыста көрсетілген бағадан артық сұрағанда 
    -Клиентке дөреке сөйлесеңіз 
    -Көлік ішінде артық адам болса 
    -Басқа жүргізуші қабылдаған тапсырысқа барсаңыз 
    -Көлігіңіздің іші лас болса
    \nСеріктесте патент болуы керек.Егер патент болмаған жағдайда, жауапкершілікті Серіктес <b>өзіне алады.</b>
    \nЕңгізілген мәліметтердің растығына Серіктес <b>кепілдік береді.</b>
    \n<b>Назар аударыңыз!</b> Тапсырыстар чатына тіркелу арқылы келісімшартқа өз келісіміңізді бересіз 
    <b>Уақыты:</b> ${new Date().toLocaleString()}`
        await bot.sendMessage(chatId, ` <b>Өтінімді</b> растаңыз 
\n<b>Есімі:</b> ${driver.firstname}
<b>Тегі:</b> ${driver.secondname} 
<b>Көлік моделі:</b> ${driver.carModel}
<b>Көлік номері:</b> ${driver.carNumber}  
<b>Телефон:</b> ${ driver.phone }
<b>Kaspi Gold:</b> ${driver.cardnumber} 
\nӨтінімді растау үшін 
- ✅ <b>Өтінімді растау</b> батырмасын таңдау қажет `, { parse_mode: "HTML", ...keyboard });
    }
    bot.onText(/🚹 ‍Есімі/, async(msg) => {
        const chatId = msg.chat.id;
        await bot.sendMessage(chatId, 'Есіміңізді жазыңыз');
        bot.once('text', async(addressMsg) => {
            const newAddress = addressMsg.text;
            driver.firstname = newAddress;
            console.log(driver.firstname);
            try {
                await Address.findOneAndUpdate({}, { firstname: driver.firstname });
                await driver.save();
                await bot.sendMessage(chatId, ` <b>Өтінімді</b> растаңыз 
\n<b>Есімі:</b> ${driver.firstname}
<b>Тегі:</b> ${driver.secondname} 
<b>Көлік моделі:</b> ${driver.carModel}
<b>Көлік номері:</b> ${driver.carNumber}  
<b>Телефон:</b> ${ driver.phone }
<b>Kaspi Gold:</b> ${driver.cardnumber} 
\nӨтінімді растау үшін 

- ✅ <b>Өтінімді растау</b> батырмасын таңдау қажет `, { parse_mode: "HTML", ...keyboard });
            } catch (error) {
                console.error('Ошибка при обновлении адреса:', error);
                await bot.sendMessage(chatId, 'Произошла ошибка при изменении адреса.');
            }
        });
    });
    bot.onText(/💳 KASPI GOLD/, async(msg) => {
        const chatId = msg.chat.id;
        await bot.sendMessage(chatId, 'Kaspi Gold-тағы телефон номеріңіз? (Төлем үшін), (Мыс. 87054651125)');
        bot.once('text', async(addressMsg) => {
            const newAddress = addressMsg.text;
            driver.cardnumber = newAddress;
            try {
                await Address.findOneAndUpdate({}, { cardnumber: driver.cardnumber });
                await bot.sendMessage(chatId, ` <b>Өтінімді</b> растаңыз 
\n<b>Есімі:</b> ${driver.firstname}
<b>Тегі:</b> ${driver.secondname} 
<b>Көлік моделі:</b> ${driver.carModel}
<b>Көлік номері:</b> ${driver.carNumber}  
<b>Телефон:</b> ${ driver.phone }
<b>Kaspi Gold:</b> ${driver.cardnumber} 
\nӨтінімді растау үшін 
- ✅ <b>Өтінімді растау</b> батырмасын таңдау қажет `, { parse_mode: "HTML", ...keyboard });
            } catch (error) {
                console.error('Ошибка при обновлении адреса:', error);
                await bot.sendMessage(chatId, 'Произошла ошибка при изменении адреса.');
            }
        });
    });
    bot.onText(/🚹 ‍Тегі/, async(msg) => {
        const chatId = msg.chat.id;
        await bot.sendMessage(chatId, 'Тегіңізді жазыңыз (Фамилия)');
        bot.once('text', async(addressMsg) => {
            const newAddress = addressMsg.text;
            driver.secondname = newAddress;
            try {
                await Address.findOneAndUpdate({}, { secondname: driver.secondname });
                await bot.sendMessage(chatId, ` <b>Өтінімді</b> растаңыз 
\n<b>Есімі:</b> ${driver.firstname}
<b>Тегі:</b> ${driver.secondname} 
<b>Көлік моделі:</b> ${driver.carModel}
<b>Көлік номері:</b> ${driver.carNumber}  
<b>Телефон:</b> ${ driver.phone }
<b>Kaspi Gold:</b> ${driver.cardnumber} 
\nӨтінімді растау үшін 
- ✅ <b>Өтінімді растау</b> батырмасын таңдау қажет `, { parse_mode: "HTML", ...keyboard });
            } catch (error) {
                console.error('Ошибка при обновлении адреса:', error);
                await bot.sendMessage(chatId, 'Произошла ошибка при изменении адреса.');
            }
        });
    });
    bot.onText(/🚘 Көлік моделі/, async(msg) => {
        const chatId = msg.chat.id;
        await bot.sendMessage(chatId, 'Көлігіңіздің моделі қандай? (Мыс. Тойота 40 қара түсті)');
        bot.once('text', async(addressMsg) => {
            const newAddress = addressMsg.text;
            driver.carModel = newAddress;
            try {
                await Address.findOneAndUpdate({}, { carModel: driver.carModel });
                await bot.sendMessage(chatId, ` <b>Өтінімді</b> растаңыз 
\n<b>Есімі:</b> ${driver.firstname}
<b>Тегі:</b> ${driver.secondname} 
<b>Көлік моделі:</b> ${driver.carModel}
<b>Көлік номері:</b> ${driver.carNumber}  
<b>Телефон:</b> ${ driver.phone }
<b>Kaspi Gold:</b> ${driver.cardnumber} 
\nӨтінімді растау үшін 
- ✅ <b>Өтінімді растау</b> батырмасын таңдау қажет `, { parse_mode: "HTML", ...keyboard });
            } catch (error) {
                console.error('Ошибка при обновлении адреса:', error);
                await bot.sendMessage(chatId, 'Произошла ошибка при изменении адреса.');
            }
        });
    });
    bot.onText(/🚘 Көлік номері/, async(msg) => {
        const chatId = msg.chat.id;
        await bot.sendMessage(chatId, 'Көлігіңіздің номерін жазыңыз. (Мыс. 156-AFT)');
        bot.once('text', async(addressMsg) => {
            const newAddress = addressMsg.text;
            driver.carNumber = newAddress;
            try {
                await Address.findOneAndUpdate({}, { carNumber: driver.carNumber });
                await bot.sendMessage(chatId, ` <b>Өтінімді</b> растаңыз 
\n<b>Есімі:</b> ${driver.firstname}
<b>Тегі:</b> ${driver.secondname} 
<b>Көлік моделі:</b> ${driver.carModel}
<b>Көлік номері:</b> ${driver.carNumber}  
<b>Телефон:</b> ${ driver.phone }
<b>Kaspi Gold:</b> ${driver.cardnumber} 
\nӨтінімді растау үшін 
- ✅ <b>Өтінімді растау</b> батырмасын таңдау қажет `, { parse_mode: "HTML", ...keyboard });
            } catch (error) {
                console.error('Ошибка при обновлении адреса:', error);
                await bot.sendMessage(chatId, 'Произошла ошибка при изменении адреса.');
            }
        });
    });
    bot.onText(/📱 Телефон номeрі/, async(msg) => {
        const chatId = msg.chat.id;
        await bot.sendMessage(chatId, 'Телефон номеріңіз?', contactRequest);

        bot.once('contact', async(contactMsg) => {
            const chatId = contactMsg.chat.id;
            if (contactMsg.text !== 'Телефон номеріңіз?') {
                const newPhoneFromContact = contactMsg.contact.phone_number;
                driver.phone = newPhoneFromContact;
                try {
                    await Address.findOneAndUpdate({}, { phone: driver.phone });
                    await bot.sendMessage(chatId, ` <b>Өтінімді</b> растаңыз 
                    \n<b>Есімі:</b> ${driver.firstname}
<b>Тегі:</b> ${driver.secondname} 
<b>Көлік моделі:</b> ${driver.carModel}
<b>Көлік номері:</b> ${driver.carNumber}  
<b>Телефон:</b> ${ driver.phone }
<b>Kaspi Gold:</b> ${driver.cardnumber} 
                    \nӨтінімді растау үшін 
                    - ✅ <b>Өтінімді растау</b> батырмасын таңдау қажет `, { parse_mode: "HTML", ...keyboard });
                } catch (error) {
                    console.error('Ошибка при обновлении номера телефона:', error);
                    await bot.sendMessage(chatId, 'Произошла ошибка при изменении номера телефона.');
                }
            }
        });

        bot.once('text', async(textMsg) => {
            const chatId = textMsg.chat.id;

            if (textMsg.text !== 'Телефон номеріңіз?' && textMsg.text.length === 11) {
                const newPhoneFromText = textMsg.text;
                driver.phone = newPhoneFromText;
                try {
                    await Address.findOneAndUpdate({}, { phone: driver.phone });
                    await bot.sendMessage(chatId, ` <b>Өтінімді</b> растаңыз 
                    \n<b>Есімі:</b> ${driver.firstname}
<b>Тегі:</b> ${driver.secondname} 
<b>Көлік моделі:</b> ${driver.carModel}
<b>Көлік номері:</b> ${driver.carNumber}  
<b>Телефон:</b> ${ driver.phone }
<b>Kaspi Gold:</b> ${driver.cardnumber} 
                    \nӨтінімді растау үшін 
                    - ✅ <b>Өтінімді растау</b> батырмасын таңдау қажет `, { parse_mode: "HTML", ...keyboard });
                } catch (error) {
                    console.error('Ошибка при обновлении номера телефона:', error);
                    await bot.sendMessage(chatId, 'Произошла ошибка при изменении номера телефона.');
                }
            }
        });

    });

}

let isDeliveryRequest = false;
async function handleDeliveryRequest(chatId) {
    const chat = await bot.getChat(chatId);
    const firstname = chat.first_name;
    await bot.sendMessage(chatId, 'Тапсырысты қай жерден алып кету қажет?');
    const firstMessage = await waitForUserResponse(chatId);
    await bot.sendMessage(chatId, 'Қай жерге апару қажет?');
    const secondMessage = await waitForUserResponse(chatId);
    await bot.sendMessage(chatId, 'Қандай затты апару қажет? (қосымша ақпарат беріңіз)');
    const type = await waitForUserResponse(chatId);
    const priceOptions = {
        reply_markup: {
            keyboard: [
                [{ text: '350' }, { text: '400' }, { text: '450' }],
                [{ text: '500' }, { text: '550' }, { text: '600' }, ],
                [{ text: '700' }, { text: '800' }, { text: '1000' }, ],
                [{ text: '1500' }, { text: '2000' }, { text: '5000' }, ],
                [{ text: '6000' }, { text: '8000' }, { text: '10000' }, ]
            ],
            resize_keyboard: true,
            one_time_keyboard: true
        }
    };
    await bot.sendMessage(chatId, 'Ұсынатын бағаңыз (₸)? Бағаны сан ретінде төменде жазсаңыз болады.', priceOptions);
    const price = await waitForUserResponse(chatId);
    const contactRequest = {
        reply_markup: {
            keyboard: [
                [{ text: '📱 Телефон номер жіберу', request_contact: true }]
            ],
            resize_keyboard: true,
            one_time_keyboard: true
        }
    };

    await bot.sendMessage(chatId, 'Телефон номеріңіз?', contactRequest);
    const phone = await waitForUserResponse(chatId);


    bot.onText(/🌎 Алып кететін мекен-жай/, async(msg) => {
        const chatId = msg.chat.id;
        await bot.sendMessage(chatId, 'Тапсырысты қай жерден алып кету қажет?');
        bot.once('text', async(addressMsg) => {
            const newAddress = addressMsg.text;
            firstMessage.text = newAddress;
            try {
                await Address.findOneAndUpdate({}, { firstAddressText: firstMessage.text });
                console.log(firstMessage.text);
                await bot.sendMessage(chatId, `Тапсырысты жіберу үшін <b>растау қажет</b> 
                \n <b>Қайдан:</b> ${firstMessage.text} 
<b>Қайда:</b> ${secondMessage.text}  
<b>Қосымша ақпарат:</b> ${type.text} 
<b>Бағасы:</b> ${price.text} ₸  
<b>Телефон:</b> ${phoneText}
\nТапсырысты растау үшін
-✅ <b>Тапсырысты жіберу</b> батырмасын таңдау қажет`, { parse_mode: "HTML", ...keyboard });
            } catch (error) {
                console.error('Ошибка при обновлении адреса:', error);
                await bot.sendMessage(chatId, 'Произошла ошибка при изменении адреса.');
            }


        });


    });

    bot.onText(/🌎 Жеткізетін мекен-жай/, async(msg) => {
        const chatId = msg.chat.id;
        await bot.sendMessage(chatId, 'Қай жерге апару қажет?');
        bot.once('text', async(addressMsg) => {
            const newAddress = addressMsg.text;
            secondMessage.text = newAddress;
            try {
                await Address.findOneAndUpdate({}, { secondAddressText: secondMessage.text });
                console.log(secondMessage.text);
                await bot.sendMessage(chatId, `Тапсырысты жіберу үшін <b>растау қажет</b> 
                \n<b>Қайдан:</b> ${firstMessage.text}
<b>Қайда:</b> ${secondMessage.text} 
<b>Қосымша ақпарат:</b> ${type.text}
<b>Бағасы:</b> ${price.text} ₸ 
<b>Телефон:</b> ${phoneText}
    \nТапсырысты растау үшін
- ✅ <b>Тапсырысты жіберу</b> батырмасын таңдау қажет`, { parse_mode: "HTML", ...keyboard });
            } catch (error) {
                console.error('Ошибка при обновлении адреса:', error);
                await bot.sendMessage(chatId, 'Произошла ошибка при изменении адреса.');
            }
        });
    });
    bot.onText(/📋 Қосымша ақпарат/, async(msg) => {
        const chatId = msg.chat.id;
        await bot.sendMessage(chatId, 'Қандай затты апару қажет? (қосымша ақпарат беріңіз)');
        bot.once('text', async(addressMsg) => {
            const newAddress = addressMsg.text;
            type.text = newAddress;
            try {
                await Address.findOneAndUpdate({}, { type: type.text });
                console.log(type.text);
                await bot.sendMessage(chatId, `Тапсырысты жіберу үшін <b>растау қажет</b> 
                \n<b>Қайдан:</b> ${firstMessage.text}
<b>Қайда:</b> ${secondMessage.text} 
<b>Қосымша ақпарат:</b> ${type.text}
<b>Бағасы:</b> ${price.text} ₸ 
<b>Телефон:</b> ${phoneText}
    \nТапсырысты растау үшін
- ✅ <b>Тапсырысты жіберу</b> батырмасын таңдау қажет`, { parse_mode: "HTML", ...keyboard });
            } catch (error) {
                console.error('Ошибка при обновлении адреса:', error);
                await bot.sendMessage(chatId, 'Произошла ошибка при изменении адреса.');
            }
        });
    });


    bot.onText(/💵 Жол ақысы../, async(msg) => {
        const chatId = msg.chat.id;
        await bot.sendMessage(chatId, 'Ұсынатын бағаңыз (₸)? Бағаны сан ретінде төменде жазсаңыз болады.', priceOptions);
        bot.once('text', async(addressMsg) => {
            const newPrice = addressMsg.text;
            price.text = newPrice;
            try {
                await Address.findOneAndUpdate({}, { price: price.text });
                console.log(price.text);
                await bot.sendMessage(chatId, `Тапсырысты жіберу үшін <b>растау қажет</b> 
                \n<b>Қайдан:</b> ${firstMessage.text}
<b>Қайда:</b> ${secondMessage.text} 
<b>Қосымша ақпарат:</b> ${type.text}
<b>Бағасы:</b> ${price.text} ₸ 
<b>Телефон:</b> ${phoneText}
    \nТапсырысты растау үшін
- ✅ <b>Тапсырысты жіберу</b> батырмасын таңдау қажет`, { parse_mode: "HTML", ...keyboard });
            } catch (error) {
                console.error('Ошибка при обновлении адреса:', error);
                await bot.sendMessage(chatId, 'Произошла ошибка при изменении адреса.');
            }
        });
    });


    bot.onText(/📱 Телефон номер../, async(msg) => {
        const chatId = msg.chat.id;
        await bot.sendMessage(chatId, 'Телефон номеріңіз?', contactRequest);

        bot.once('contact', async(contactMsg) => {
            const chatId = contactMsg.chat.id;
            if (contactMsg.text !== 'Телефон номеріңіз?') {
                const newPhoneFromContact = contactMsg.contact.phone_number;
                phoneText = newPhoneFromContact;
                try {
                    await Address.findOneAndUpdate({}, { phone: phoneText });
                    await bot.sendMessage(chatId, `Тапсырысты жіберу үшін <b>растау қажет</b> 
                    \n<b>Қайдан:</b> ${firstMessage.text}
    <b>Қайда:</b> ${secondMessage.text} 
    <b>Қосымша ақпарат:</b> ${type.text}
    <b>Бағасы:</b> ${price.text} ₸ 
    <b>Телефон:</b> ${phoneText}
        \nТапсырысты растау үшін
    - ✅ <b>Тапсырысты жіберу</b> батырмасын таңдау қажет`, { parse_mode: "HTML", ...keyboard });
                } catch (error) {
                    console.error('Ошибка при обновлении номера телефона:', error);
                    await bot.sendMessage(chatId, 'Произошла ошибка при изменении номера телефона.');
                }
            }
        });

        bot.once('text', async(textMsg) => {
            const chatId = textMsg.chat.id;

            if (textMsg.text !== 'Телефон номеріңіз?' && textMsg.text.length === 11) {
                const newPhoneFromText = textMsg.text;
                phoneText = newPhoneFromText;
                try {
                    await Address.findOneAndUpdate({}, { phone: phoneText });
                    await bot.sendMessage(chatId, `Тапсырысты жіберу үшін <b>растау қажет</b> 
                    \n<b>Қайдан:</b> ${firstMessage.text}
    <b>Қайда:</b> ${secondMessage.text} 
    <b>Қосымша ақпарат:</b> ${type.text}
    <b>Бағасы:</b> ${price.text} ₸ 
    <b>Телефон:</b> ${phoneText}
        \nТапсырысты растау үшін
    - ✅ <b>Тапсырысты жіберу</b> батырмасын таңдау қажет`, { parse_mode: "HTML", ...keyboard });
                } catch (error) {
                    console.error('Ошибка при обновлении номера телефона:', error);
                    await bot.sendMessage(chatId, 'Произошла ошибка при изменении номера телефона.');
                }
            }
        });

    });
    phoneText = phone.contact ? phone.contact.phone_number.toString() : (phone.text && phone.text.length === 11 ? phone.text : '');
    const addressesForDelivery = new AddressForDelivery({
        firstAddressText: firstMessage.text,
        secondAddressText: secondMessage.text,
        type: type.text,
        price: price.text,
        phone: phoneText,

    });
    const savedAddress = await addressesForDelivery.save();
    savedAddressId = savedAddress._id;
    const keyboard = {
        reply_markup: {
            keyboard: [
                [{ text: '✅ Тапсырысты жіберу' }],
                [{ text: '🖊 Өзгеріс енгізy' }],
                [{ text: '❌ Тапсырысты жою' }]
            ],
            resize_keyboard: true,
            one_time_keyboard: true
        }
    };
    await bot.sendMessage(chatId, `Тапсырысты жіберу үшін <b>растау қажет</b> \n\n<b>Қайдан:</b> ${firstMessage.text} \n<b>Қайда:</b> ${secondMessage.text} \n<b>Қосымша ақпарат:</b> ${type.text} \n<b>Бағасы:</b> ${price.text} ₸ \n<b>Телефон:</b> ${phoneText} \n\nТапсырысты растау үшін \n- ✅ <b>Тапсырысты жіберу</b> батырмасын таңдау қажет`, { parse_mode: "HTML", ...keyboard });
    forwardmessage = `<b>---ЖАҢА ТАПСЫРЫС---</b> \n\n<b>Қайдан:</b> ${firstMessage.text} \n<b>Қайда:</b> ${secondMessage.text} \n<b>Қосымша ақпарат:</b> ${type.text} \n\n<b>Тапсырыс типі: Зат жеткізу</b> \n<b>Бағасы:</b> ${price.text} ₸ \n<b>Телефон:</b>`;
    destination_message = `<b>${firstname} сіздің тапсырысыңыз қабылданды.</b>
    \n<b>Тапсырыс №</b> ${chatId}
    \n<b>Тапсырыс типі: Зат жеткізу</b>
\n<b>Қайдан:</b> ${firstMessage.text}
<b>Қайда:</b> ${secondMessage.text}
<b>Қосымша ақпарат:</b> ${type.text} 
<b>Бағасы:</b> ${price.text} ₸`;
    client_phone = phoneText;
    order_price = price.text;
}
let forwardmessage = '';
let contract = ' ';
let destinationChatId = '-4094544621';
let client = ' ';
let client_phone = ' ';
let order_price = ' ';
bot.on('message', async(msg) => {
    const chatId = msg.chat.id;
    const username = msg.from.first_name;
    const messageText = msg.text;
    const options = {
        reply_markup: {
            inline_keyboard: [
                [{
                    text: 'Чек жіберу',
                    url: 'https://t.me/damiraitbay'
                }]
            ]
        }
    }
    const discard = {
        reply_markup: {
            inline_keyboard: [
                [

                    {
                        text: 'Тапсырыстан бас тарту',
                        callback_data: 'change_message'
                    }
                ]
            ]
        }
    }
    const apply = {
        reply_markup: {
            inline_keyboard: [
                [

                    {
                        text: 'Қабылдау',
                        callback_data: 'apply_message'
                    }
                ]
            ]
        }
    }
    const getOrder = {
        reply_markup: {
            inline_keyboard: [
                [{
                    text: '📲Тапсырыс алып бастау',
                    url: 'https://t.me/+fVEoAG-R1RhhNmYy'
                }]
            ]
        }
    }
    switch (messageText) {
        case 'Баланс толтыру':
        case '/balance':
            let user1 = await User.findOne({ user_number: String(chatId).substring(0, 5) });
            if (user1) {
                bot.sendMessage(chatId, `ID <b>${chatId}</b> \n\nСіздің балансыңызда <b>${user1.balance} ₸</b> \nБонус <b>0.00 ₸</b> \n\n<b>Баланс толтыру үшін,</b> төмендегі номерге аударма жасайсыз: \n- Kaspi Gold  / +77718466803 (Дамир А.) \n\nТөмендегі батырмаға өтіп, аударым <b>чегін жібересіз</b>`, {
                    parse_mode: "HTML",
                    ...options

                });
            } else {
                bot.sendMessage(chatId, `ID <b>${chatId}</b> \n\nСіздің балансыңызда <b>0 ₸</b> \nБонус <b>0.00 ₸</b> \n\n<b>Баланс толтыру үшін,</b> төмендегі номерге аударма жасайсыз: \n- Kaspi Gold  / +77718466803 (Дамир А.) \n\nТөмендегі батырмаға өтіп, аударым <b>чегін жібересіз</b>`, {
                    parse_mode: "HTML",
                    ...options

                });
            }
            break;
        case 'Такси шақыру':
        case '/taxi':
            await handleTaxiRequest(chatId);
            break;
        case 'Қызылордаға такси':
            await handleTaxiForQyzylordaRequest(chatId);
            break;
        case 'Жеткізу(Доставка)':
            await handleDeliveryRequest(chatId);
            break;
        case 'Такси болу':
        case '/partner':
            await handlePartnerRequest(chatId);
            break;
        case '❌ Тапсырысты жою':
            await bot.sendMessage(chatId, '🚕');
            break;
        case '❌ Өтінімді жою':
            await bot.sendMessage(chatId, 'Сұраным өшірілді. Жаңадан сұраным беру үшін /partner командасын орындау қажет. Рахмет!');
            break;
        case '✅ Тапсырысты жіберу':
            client = chatId;
            await bot.sendMessage(destinationChatId, `${forwardmessage} жекеге жіберіледі`, { parse_mode: "HTML", ...apply });
            await bot.sendMessage(chatId, `<b>Жауапты</b> күтіңіз \n\nТапсырыс өңделуде...  \n- Жүргізуші сізге хабарласатын болады  \n\n<b>${username}</b>,  Жалағаш Такси сервисін қолданғаңызға Рахмет!`, { parse_mode: "HTML", ...discard });
            break;
        case '✅ Өтінімді растау':
            await bot.sendMessage(chatId, contract, { parse_mode: "HTML", ...getOrder });
            await bot.sendMessage(chatId, '🚕');
            break;
        case 'Азық-түлікке тапсырыс':
            await bot.sendMessage(chatId, `Азық түлікті <b>15 минутта</b> жеткіземіз! 
            \nЕнді дүкенге бармай азық-түлікке тапсырыс бере аласыз... 
- Ал біз сізге тапсырысты <b>15 минутта жеткіземіз.</b > 
\nТөмендегі дүкендер тізімінен қажетті дүкенге хабарласа аласыз `, { parse_mode: "HTML" });
            await bot.sendMessage(chatId, `🔹 <b>Қалдыгүл апа</b> 
<i>Мекен-жай:</i> Сму Әпрезов Әбжалиев қиылысы
<i>Телефон:</i> +77059613071 
<i>Жұмыс уақыты:</i> 09: 00 - 23: 00
🔹 <b>Сымбат магазин</b> 
<i>Мекен-жай:</i> Шаменов 105
<i>Телефон:</i> +77009616106 
<i>Жұмыс уақыты:</i> 09: 00 - 01: 00
🔹 <b>Музия магазин</b> 
<i>Мекен-жай:</i> Музия магазин
<i>Телефон:</i> +77075359906 
<i>Жұмыс уақыты:</i> 08: 00 - 02: 00
🔹 <b>Жеміс жидек</b> 
<i>Мекен-жай:</i> Төлеген базардағы жеміс жидек
<i>Телефон:</i> +77075435760 
<i>Жұмыс уақыты:</i> 09: 00 - 19: 00
🔹 <b> Жанерке магазин </b> 
<i>Мекен-жай:</i> Жүргенов көшедегі
<i>Телефон:</i> +77768677318 
<i>Жұмыс уақыты:</i> 09: 00 - 00: 00
🔹 <b>Адия магазин</b> 
<i>Мекен-жай:</i> Бұхарбай көшесі
<i>Телефон:</i> +77051420646 
<i>Жұмыс уақыты:</i> 09: 00 - 03: 00
🔹 <b>Гүлназ магазин азық - түлік бар гүлдер бар</b> 
<i>Мекен-жай:</i> Қазыбек би көшесі
<i>Телефон:</i> +77071780484 
<i>Жұмыс уақыты:</i> 10: 00 - 02: 00
🔹 <b>Жания магазин</b> 
<i>Мекен-жай:</i>Қазыбек би 56 / 9 246 қасы
<i>Телефон:</i> +77054301275 
<i>Жұмыс уақыты:</i> 07: 30 - 03: 00 `, { parse_mode: "HTML" });

            break;
        case 'Дәріханалар':
            await bot.sendMessage(chatId, `🔹 <b>Вита аптека</b> 
<i>Мекен-жай:</i> Нартайға қарама қарсы
<i>Телефон:</i> +77026225000 
<i>Жұмыс уақыты:</i> 09: 00 - 19: 00 `, { parse_mode: "HTML" });
            break;
        case 'Гүлдер':
            await bot.sendMessage(chatId, `🔹<b>Жалағаш гүлдер</b> 
<i>Мекен-жай:</i> 
<i>Телефон:</i> +77023749174 
<i>Жұмыс уақыты:</i> 09:00 - 22:00
🔹 <b>Айлин</b> 
<i>Мекен-жай:</i> 
<i>Телефон:</i> +77074132310 
<i>Жұмыс уақыты:</i> 09:00 - 21:00 `, { parse_mode: "HTML" });
            break;
        case '/topup':
            await adding_balance(chatId);
            break;
    }
});
let destination_message = ' ';
bot.on('callback_query', async(callbackQuery) => {
    const data = callbackQuery.data;
    const chatId = callbackQuery.from.id;
    const messageId = callbackQuery.message.message_id;
    const username = callbackQuery.from.first_name;
    const driver_done = {
        reply_markup: {
            inline_keyboard: [
                [

                    {
                        text: 'Мен келдім',
                        callback_data: 'done_message'
                    }
                ]
            ]
        }
    }
    if (data === 'change_message') {
        bot.editMessageText(`<b>${ username }</b>, сіздің тапсырысыңыз кері қайтарылды. \n\n<b>- Жалағаш Такси</b> қызметін қолданғаңызға рахмет!`, {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: "HTML"
        });
    }
    if (data === 'done_message') {
        let driver = await taxiDates.findOne({ driver_id: String(chatId).substring(0, 5) });
        bot.editMessageText(`${forwardmessage} ${client_phone}
        \nҚабылдады: ${driver.firstname}`, {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: "HTML",
        });
        await bot.sendMessage(client, `Жүргізуші келді. Сізді көрсетілген жерде күтуде`, { chat_id: chatId, parse_mode: "HTML" });

    }
    if (data === 'apply_message') {
        let driver = await taxiDates.findOne({ driver_id: String(chatId).substring(0, 5) });
        let user = await User.findOne({ user_number: String(chatId).substring(0, 5) });
        user.balance = user.balance - order_price * 0.1;
        balance1 = user.balance;
        await user.save();
        if (user && driver && user.balance > 0) {
            await bot.sendMessage(client, `${destination_message} 
        \n<b>Жүргізуші:</b> ${driver.firstname} ${driver.secondname} 
<b>Телефон:</b> ${driver.phone}
<b>Kaspi Gold:</b> ${driver.cardnumber}
\n<b>Көлік Моделі:</b> ${driver.carModel}
<b>Көлік номері:</b> ${driver.carNumber}
        \nЖүргізушіні күтіңіз. Сәттілік!`, { chat_id: chatId, parse_mode: "HTML" });
            await bot.sendMessage(chatId, `${forwardmessage} ${client_phone}
        \nҚабылдады: ${driver.firstname} ${driver.secondname}`, { chat_id: chatId, parse_mode: "HTML", ...driver_done });
            bot.editMessageText(`${forwardmessage} жекеге жіберілді
        \n<b>Тапсырысты қабылдады:</b> ${driver.firstname}`, {
                chat_id: destinationChatId,
                message_id: messageId,
                parse_mode: "HTML"
            });
        } else if (!driver) {
            await bot.sendMessage(chatId, `Өтінемін өзіңіз туралы ақпаратты жазыңыз. Ол үшін /partner батырмасын басыңыз`, { chat_id: chatId, parse_mode: "HTML" });
        } else {
            await bot.sendMessage(chatId, `Сіздің балансыңыз тапсырысты қабылдау үшін жеткіліксіз.Балансыңызды толтыру үшін мәзірдегі <b>Баланс толтыру</b> (/balance) батырмасына өтіңіз.`, { chat_id: chatId, parse_mode: "HTML" });

        }
    }
});
async function waitForUserResponse(chatId) {
    return new Promise((resolve) => {
        bot.once('message', (msg) => {
            if (msg.chat.id === chatId && (!msg.entities || msg.contact || (msg.text && msg.text.length === 11))) {
                resolve(msg);
            }
        });
    });
}
bot.onText(/🖊 Өзгеріс енгізу/, async(msg) => {
    const chatId = msg.chat.id;
    const keyboard = {
        reply_markup: {
            keyboard: [
                [{ text: '🌎 Шығaтын мекен-жай.' }],
                [{ text: '🌎 Баратын мекен-жай.' }],
                [{ text: '💵 Жол ақысы.' }],
                [{ text: '📱 Телефон номер.' }],
                [{ text: '👤 Жолаушылар саны.' }],
                [{ text: '⏰ Уақыт.' }]
            ],
            resize_keyboard: true,
            one_time_keyboard: true
        }
    };
    await bot.sendMessage(chatId, 'Тапсырысты өзгерту үшін қажетті ұяшықты таңдаңыз', keyboard);
});
bot.onText(/🖊 Өзгеріс енгізy/, async(msg) => {
    const chatId = msg.chat.id;
    const keyboard = {
        reply_markup: {
            keyboard: [
                [{ text: '🌎 Алып кететін мекен-жай' }],
                [{ text: '🌎 Жеткізетін мекен-жай' }],
                [{ text: '📋 Қосымша ақпарат' }],
                [{ text: '💵 Жол ақысы..' }],
                [{ text: '📱 Телефон номер..' }]
            ],
            resize_keyboard: true,
            one_time_keyboard: true
        }
    };
    await bot.sendMessage(chatId, 'Тапсырысты өзгерту үшін қажетті ұяшықты таңдаңыз', keyboard);
});
bot.onText(/🖊 Өзгеpіс енгізу/, async(msg) => {
    const chatId = msg.chat.id;
    const keyboard = {
        reply_markup: {
            keyboard: [
                [{ text: '🚹 ‍Есімі' }],
                [{ text: '🚹 ‍Тегі' }],
                [{ text: '📱 Телефон номeрі' }],
                [{ text: '💳 KASPI GOLD' }],
                [{ text: '🚘 Көлік моделі' }],
                [{ text: '🚘 Көлік номері' }]
            ],
            resize_keyboard: true,
            one_time_keyboard: true
        }
    };
    await bot.sendMessage(chatId, 'Өзгерту үшін қажетті ұяшықты таңдаңыз', keyboard);
});
bot.onText(/🖊 Өзгеріc енгізу/, async(msg) => {
    const chatId = msg.chat.id;
    const keyboard = {
        reply_markup: {
            keyboard: [
                [{ text: '🌎 Шығатын мекен-жай' }],
                [{ text: '🌎 Баратын мекен-жай' }],
                [{ text: '💵 Жол ақысы' }],
                [{ text: '📱 Телефон номер' }],
            ],
            resize_keyboard: true,
            one_time_keyboard: true
        }
    };
    await bot.sendMessage(chatId, 'Тапсырысты өзгерту үшін қажетті ұяшықты таңдаңыз', keyboard);
});
