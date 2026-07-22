from django.core.management.base import BaseCommand

from api.models import Category, OfficeLocation, PortfolioItem, Product, Review

HERO_IMAGE = (
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBwRz0YX83zc4mMxH5ORj_FQMrgtVV1puzInqqXmD_Rlgi-fQ0qkiVa1pmCIZEdoMlP3tMuv_QTTg-g5c-flqB8Mm_T0L7InLbQmUtfctOXj5iB5XVfvlYMMa1M_POn3Va8QEckOP15PVX2ud6qwlLnlfv-PJhwZ3LaeXURya8a05FXHXbaQP3gl9u3zXWgftAOuV7LgYsR7jC78ZJev8qOY_mBOSx7dr0jVpodZ8m6WdLt1MR0PySMH_T_tMqq7T5G5-GBYv6h_9g'
)

CATEGORIES = [
    ('granite-monuments', 'Гранит', 'От 24 500 ₽', 'https://lh3.googleusercontent.com/aida-public/AB6AXuB3TQzYLSdzTQdNcPY6wjwxodpJa75sDp0ERJGMEq6VSWhAaSauc8QElqTGJv1tM2IBG2fzfW4_R26FMZNSAdQW6kqSG3mtl8fORv0oRPQtVhODMtwykuZ4ywctIoO8G0rVx_QAaZR7OIsiGyaAiAJRC5__hbHWGIIjkcp0EmdMKV1XyAr3PQpiMN-WeYxQvO4xerRyZFeF80lDyupwaZh7ayfRbRpMCmZ8l7ViHcBmRER1uhEPzsjv4DAV9tozO4mIAGifKhqyYZc'),
    ('marble-monuments', 'Мрамор', 'От 18 200 ₽', 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4vi7RU0renb3O2z4a6180C2jrYxEOz5_6hxL84USwMPoGv5NTWFHlxo3z7Z9ZIOS8os4njMxQJGvh-Cwectw8DQSg7GV0YhsWnwVyaBuWS2r6Ef4VNBAJlq-oW2gY3ijOaNSdr2GTrviE-40ILacY7ix9AaDJ7emkgef3A0CjCRQSHBRnX35sm_hVAS8600BkQEouU92HJ50IcOAnTaOpcewdaktCg2_3cdfbTYBzYEKylxD5wJkqh8YqRe4ARdxKQhPZKXZTFIU'),
    ('svo-monuments', 'СВО', 'Особые условия', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAgvw2kR9xjYR1qZFqAw6VLhSVTBRdkhzWSCN-es1BE7vQexs0NZLlAffScbIJFRwx5P_JgJ_yaD3V4xMnYmaHlGEz0egw6SMmMW2JA_F7rbz229ankKaQponl19MUwaiPwpPmnXXvGjAilZY5JlP1xBg63uZPV1gZ5uxYvGCKQGakjGcxS9neLa_d0UvkWxoPpGwHAXb4cCHbelFPZS6eLFeO-pQ0x_BxHUCseTGQ6BVkn8liYZRm3TK6MKZgnA2qDlroxu4LXlKE'),
    ('elite-complexes', 'Элитные комплексы', 'Индивидуальный расчёт', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBp5PNc0_Q_J0U4AUnI6Bi8JHDBXek3hIovTRXhli0LqGnhMtPkj-81Zl6gODI-2-0yHx4uht_zs8dM9HRITKVTFVtmBEEpT_z_11jBJmLUL_9MG0K0nqPspCdhpbcyC0zD0bqAf5B1Hdn1_IgUvw-Lbe42nrRmA_KBDaDc2ui0w5tVr57iRzhOJdM86HsVk1ap2Ur_uys-5qM6U8n8_ngjZSjPhDKJx9XZTcLSUWfEV34QxiM1Gu8DSHtIsVL1kPqtXeEMW77Xd34'),
    ('complexes', 'Комплексы', '', 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4h5JhDoR0ewMckclMdty7-fbITvgRzr4zwiz3LA-ZKJVLZsYBETjxudVXsJ2WQ618f98KiiotzdeYVv1_JY-qSQMpe_NFYy-opTSI_kM_Olf7OaHulyW_SrK3K2-XRI2czHwcbLRyE0EEMFrzegF1SrUo2PLggDzAA4jb8iHiSHTs6-5CPV9HuVWO8A9CNdQCqWLU5bJtYNHKjEOC2D2pxVt-5LlxkajAlQfEn2PwivSPq7P9_K3NHOe6IEg9NNTCvkSVnxEv58I'),
    ('fences', 'Ограды', '', 'https://lh3.googleusercontent.com/aida-public/AB6AXuA7nH0LI94ESq3j3OyiL9ZuugbtVnPNZNizKd1vazLoo1wVAHFv_FldH0lsJA9c-r2lsEzLPWDGR8onJylFsPePq0scU4rRmYoxLACoAhQiAq80CZkpm8sO074UjF-DsM-8BGdfYfPT_XIXjMK5RvHi-i6NBKZHKWGe1PF-I-d3tlS4_Pave73mUFKohkmtXmViTuTe2ktXg99sAIqV2H5yEzSKLTsCujbxen9PDN_kGzpfZlsnEcThm2sGNJwLdzKT0VovrC82Wdg'),
    ('benches', 'Лавочки', '', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYYSAa2fpWLt5gD3bpq4IphsJKDdLjuwnMx_vMLvRr52-dyuvH1qNXl-DV8xEigPycbatmy-GDPDJKnx9dPhcFe9lAa570L4UezHkuZZ69cQ5MjdzejJIcoi_285P2l1YPFDzoZrltTmgu56JxWhlaaNvMgxMaCZtatm1BpU0XUHf65xuhx6piM80S9lBYlHrZzZwkOuoq6jAyNdvAxLj6TNLJn2y_9nF9AOL-sdYwIjrBSKbh0q9VSAbK-eFt69lZP_JWy1ZQXQQ'),
    ('vases', 'Вазоны', '', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBiNzjmT1BY_X6XziiUhNCwuSSN5oMgqySWrWInariuyxm8Xs_B2dB1DyPbw2yoQ5dvgn38aHiqWP_dU8EUOyBiVNANSu11fGhNRIikG0SqqguykyGKc1pEI6T1YARr_YUUPgd5gGfgF-36TkamIDsLZBRWco9yZIeajPDdQJn5-RePmUZ2eX36KDNqeQWPaPnPApfc6qSL9OPqECgPvcSStqzDrlFtFDnnoKQe9XpDBR3Vd1-d1calMLXpjwOvpV_Lw2yrGluyuwE'),
]

PRODUCTS = [
    ('KK-1001', 'vechnost-i', 'Вечность I', 'marble', 'classic', 'single', 'МРАМОР КОЕЛГА / КЛАССИКА', 240000, 'https://lh3.googleusercontent.com/aida-public/AB6AXuBypOaS_zJW7H4_VkRqtpUm1198vn5Wk566OiJAJcZHLCQ01eY4QzxNkcZ4dxmZ4UwbTlCRrRFe8LmXRq18mWHtOaTwFyZbPtI0JtUOWXjItG-jQJT_EMeTBXcXjycxZ-_-nk54fprOzKXybuKjOtR1tp9JA9GJk16Pk43PcvIK52A7DKgmgDt2imGgevrA07Vjwz3eh6fT9EfLajw2oZ2Do9e3ceI3NWa9LdZbIOyOoduUnn64TzQqzmzTZiaYBPum6A4MBreV8CQ', '120×60×10 см', 'Зеркальная полировка', True),
    ('KK-1002', 'gorizont', 'Горизонт', 'granite', 'modern', 'single', 'ГРАНИТ / МИНИМАЛИЗМ', 185000, 'https://lh3.googleusercontent.com/aida-public/AB6AXuAuCbp9AbqlDh2sKceFyqC4feT2VH3Vm10UFcbXyt7QFhnudSZHpUiJ4m7Cj88M4KC4F6rWrdhOBY20ONXdyV8NSzDiy__LE5xjDkQf9rQhh5dMx4Bpb6D-xQbzk31RXhUxse5WeJPnJdC1jKaqZc_NVt1LdL4O-h4LDkavvGrbE3f3K6CfVqGatVLDK8pJNOyQApVmkGn9HMFnS6-GokOr9dW0MNqBHePsAA7ITyEQLN62CHJC1oTY7yaRrn5vtm2Ycm0QEXNgHug', '110×55×8 см', 'Матовая обработка', True),
    ('KK-9042', 'sila', 'Монумент «Сила»', 'gabbro', 'author', 'single', 'ГАББРО-ДИАБАЗ / ЗЕРКАЛЬНАЯ ПОЛИРОВКА', 185000, 'https://lh3.googleusercontent.com/aida-public/AB6AXuCT42gpoe4B6v1NwVBUe6vX6_Qumt6wMYQ_Z3xTJnk9X6h2kMdeh4WtA--Nt8mhR-og12YAGOMOfpmGf9tFRVP_xVZx63Ev_FnJVGx4r2XPJU7_DiusvH6p3WoJU6k3689A-bO_dKD1CPOeNFTjWDPr5lxjleMDlgOTKIdGEMf4-um6gxROS5O-8GEclJCe8R23UuEJasfi9EjF4xSizO_fS5D7od9vFQQ5QQbV_Pm4eEZXIor6gmkUCiVlVrNenSGtVHPsrL1eXIg', '120×60×10 см', 'Зеркальная полировка', True),
    ('KK-1128', 'vechnost-portrait', 'Портрет «Вечность»', 'marble', 'author', 'single', 'БЕЛЫЙ МРАМОР / ХУДОЖЕСТВЕННАЯ РУЧНАЯ РАБОТА', 420000, 'https://lh3.googleusercontent.com/aida-public/AB6AXuBVdRGHWpjhn63_8Ye3uYoujnJilJVeWPexCTFcJjO7CTaN5CeCJ8PIUA4U0CWBOCFertYX6OzwngZcqinWKUz6ga-cKmu2kuY8B7Jmem1CbTkkfftot_M3dwBTu0aCHgJ7tXiL5GFSRXr07enOnZVoWPFcqrBfOCUOcubp8T71t5Ben16ZPCgGFVwDTSqhyuTtDeOw3AZfKGqGXWIQlsm4lo4wff2DAq6CCPNKrRbSyaGkpJ0G10zRPSq6yOGXXWM7e42mvoT9W5A', '100×50×8 см', 'Художественная гравировка', True),
    ('KK-1004', 'stela-oda', 'Стела Ода', 'gabbro', 'author', 'single', 'ГАББРО / АВТОРСКИЕ', 310000, 'https://lh3.googleusercontent.com/aida-public/AB6AXuCT42gpoe4B6v1NwVBUe6vX6_Qumt6wMYQ_Z3xTJnk9X6h2kMdeh4WtA--Nt8mhR-og12YAGOMOfpmGf9tFRVP_xVZx63Ev_FnJVGx4r2XPJU7_DiusvH6p3WoJU6k3689A-bO_dKD1CPOeNFTjWDPr5lxjleMDlgOTKIdGEMf4-um6gxROS5O-8GEclJCe8R23UuEJasfi9EjF4xSizO_fS5D7od9vFQQ5QQbV_Pm4eEZXIor6gmkUCiVlVrNenSGtVHPsrL1eXIg', '130×65×12 см', 'Глубокая гравировка', True),
    ('KK-1005', 'duet', 'Дуэт', 'granite', 'classic', 'double', 'ГРАНИТ + МРАМОР / ДВОЙНЫЕ', 450000, 'https://lh3.googleusercontent.com/aida-public/AB6AXuBVdRGHWpjhn63_8Ye3uYoujnJilJVeWPexCTFcJjO7CTaN5CeCJ8PIUA4U0CWBOCFertYX6OzwngZcqinWKUz6ga-cKmu2kuY8B7Jmem1CbTkkfftot_M3dwBTu0aCHgJ7tXiL5GFSRXr07enOnZVoWPFcqrBfOCUOcubp8T71t5Ben16ZPCgGFVwDTSqhyuTtDeOw3AZfKGqGXWIQlsm4lo4wff2DAq6CCPNKrRbSyaGkpJ0G10zRPSq6yOGXXWM7e42mvoT9W5A', '160×80×12 см', 'Комбинированная отделка', True),
    ('KK-1006', 'zenit', 'Зенит', 'labradorite', 'modern', 'single', 'ЛАБРАДОРИТ / МИНИМАЛИЗМ', 215000, 'https://lh3.googleusercontent.com/aida-public/AB6AXuA8pR7cZjn2aLIx1dkwc7TVhQiVoCJ1d17rjs2DqaGEtyMVY8dl3BixDHg8Kom7bh0jBwC0VCYVzZLY1pc5ZfhMpOEOcSdpYYwSEaYjaPDoBsRTT08l9uFTrElNIeeswAf_hS1M_eMs__vY2ytlWay7LjWIoDEIHAxv_wKVKmC-GTkUR4X1Nsz6MuDfRPw0847tnxv2POVR8D2ScP-BuyRdCCBAX5S2pFsjuWGjP3vBNZeFgvF8BFWFsf1wktn81EwlXPPp_J3hxZY', '100×50×8 см', 'Минималистичная форма', False),
    ('KK-1007', 'kolonna-ii', 'Колонна II', 'marble', 'classic', 'complex', 'МРАМОР / КЛАССИКА', 520000, 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtR9raDqtU871mtsEGJBBLDnMZJZtw1R-HRol5JpqM3ewf7vRd1lxVbnxgobCS2XuG1Wmnq-1P3tqasRsTyEjnuIiqTj7xADgKxEiDfsulwXSJ7Jg7UGcStZBAVf4Ka-8BcW4-BgisYN00zqlUTBT5g3wBumc3_kGIwMYd_cduEz2e4E0aXGWNLFRpo_NUsCY_E35pbA9RZAvZTe0vZYWosn3ZA1ByFtnmQeKPx6skMpv1v1CrAsv9JCfIYJoj6Yuo674gKFCTQF4', '180×90×15 см', 'Классическая резьба', False),
    ('KK-1008', 'avangard', 'Авангард', 'granite', 'author', 'single', 'ГРАНИТ / АВТОРСКИЕ', 290000, 'https://lh3.googleusercontent.com/aida-public/AB6AXuCttMnNH-e26_wfQt-iJSOccwoNKdgb44XuBDXIrnHyCOuHtY6P_gJqSzkLOT4gGctC-6GlS4W0bJojyWI2wgNzYPV017OB52C5gybaDo9L2nDea4eEuRBSjCDpQj-SpeUaT1DCT15-qd9P_lW3jGzDkEEP_e3TlA0DpIMPmEEYqVkcbUP9IY6ZzI5uWOWHW2w4IVW4RsGp37xzTX1Ye6zUFSXxTvNk0OxMh7SLKhnXHAwMy63neodx768hkjFkVPuiqIB0SUmjM7s', '120×70×10 см', 'Авторский дизайн', False),
    ('KK-1009', 'chest', 'Честь', 'gabbro', 'classic', 'svo', 'ГАББРО / СВО', 160000, 'https://lh3.googleusercontent.com/aida-public/AB6AXuD3FDz6AEBapPBTulr9YJcf_vMPuy5FVyxWdkBoMUvxVt86S0byIFha4SaVoZhV7OEZsNrxxIvezcYN3Xp99Qeqc9MPXfxw5loIsVbG7obVGsMee1HQZUF28Vr4P0UPv2ag_yK94uuZz1rxMnrW-stOR3lvHn4FrbbUMffCtBoB0DPxsPoo4hIENT_t2CRUNReQWvi2q5spcjNhACk0D6WmtuIYMn4a48byy9Qs2Dt9FgpV_0v8Z6mvQUfqR8_BKCnrcvOODZ3cwVE', '100×50×8 см', 'Воинская символика', True),
]

LOCATIONS = [
    (
        'rodniki',
        'пос. Родники',
        'ул. Лесная, 70',
        '+7 (918) 240-57-87',
        44.7506,
        39.9149,
        True,
        True,
        'krasnodar_krai',
        0,
        'Офис и приём заказов. Изготовление памятников, консультации, выезд на кладбище.',
    ),
]

REVIEWS = [
    ('Елена М.', '«Спасибо большое всей команде за чуткое отношение. Мемориал получился именно таким, как мы представляли...»', 5, 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4h5JhDoR0ewMckclMdty7-fbITvgRzr4zwiz3LA-ZKJVLZsYBETjxudVXsJ2WQ618f98KiiotzdeYVv1_JY-qSQMpe_NFYy-opTSI_kM_Olf7OaHulyW_SrK3K2-XRI2czHwcbLRyE0EEMFrzegF1SrUo2PLggDzAA4jb8iHiSHTs6-5CPV9HuVWO8A9CNdQCqWLU5bJtYNHKjEOC2D2pxVt-5LlxkajAlQfEn2PwivSPq7P9_K3NHOe6IEg9NNTCvkSVnxEv58I', True),
    ('Алексей Петрович', 'Качество гранита потрясающее. Установили точно в срок, несмотря на сложные погодные условия. Рекомендую ИП «Чепелов» всем.', 5, 'https://lh3.googleusercontent.com/aida-public/AB6AXuCN6hHBZXz_NvRLR6tY9fxdbeK1L5FjeodbV3VvazlazEptbNIiFZX6Ka1A1CrbgaF4cs0HcTBH2w04milWXmEkWjRWxnj2hojFDRxRSV4wXHX-lZUV9QRQrxTkqeKFzqjsn2_mFbR7g1g2kWc5-7P2pGYw5zBMRDVdRk5vJOg6YcoSq_JqRiI8Ezbw5hwMDB9miMC_qjrdJrVq89v3YsiBkkntWH3OOcPq1TQWAKI3g2o9Mi7FlnomAo3JbKoHZWcE6hvzr07pEOQ', False),
    ('Семья Каримовых', 'Очень довольны художественной гравировкой. Лицо на камне получилось как живое. Спасибо мастерам!', 5, 'https://lh3.googleusercontent.com/aida-public/AB6AXuCPUpSxVEiWrZ5nRDYib7_GbckxgGwgMqe5JxwSi62kfRnwwWzLGuBPwSFtDYG0OjUomM57Jy8pqvseGWZK66AYWo28WWf4R5sxJ6TMsbMarH-nIqBnALTyiMG4mhn32cm0WSqi_xkw5uTkPJUDru1migt9HzYf_M2i02zJ8_rnED-LEoEQTtC8-DADEEUKd5WDwifyKXqcVh7qmtwQEUpmwn8wf1IUQPqYIZ1oOax__-biwNRcUlv07bxzsxQA1BpcC4P3PhBusCk', False),
]

PORTFOLIO = [
    ('Мемориал «Вечность»', 'Габбро-диабаз', 'Ростов-на-Дону', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCN6hHBZXz_NvRLR6tY9fxdbeK1L5FjeodbV3VvazlazEptbNIiFZX6Ka1A1CrbgaF4cs0HcTBH2w04milWXmEkWjRWxnj2hojFDRxRSV4wXHX-lZUV9QRQrxTkqeKFzqjsn2_mFbR7g1g2kWc5-7P2pGYw5zBMRDVdRk5vJOg6YcoSq_JqRiI8Ezbw5hwMDB9miMC_qjrdJrVq89v3YsiBkkntWH3OOcPq1TQWAKI3g2o9Mi7FlnomAo3JbKoHZWE6hvzr07pEOQ'),
    ('Семейный пантеон', 'Дымовский гранит', 'Краснодар', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCPUpSxVEiWrZ5nRDYib7_GbckxgGwgMqe5JxwSi62kfRnwwWzLGuBPwSFtDYG0OjUomM57Jy8pqvseGWZK66AYWo28WWf4R5sxJ6TMsbMarH-nIqBnALTyiMG4mhn32cm0WSqi_xkw5uTkPJUDru1migt9HzYf_M2i02zJ8_rnED-LEoEQTtC8-DADEEUKd5WDwifyKXqcVh7qmtwQEUpmwn8wf1IUQPqYIZ1oOax__-biwNRcUlv07bxzsxQA1BpcC4P3PhBusCk'),
    ('Авторский проект', 'Мрамор Koelga', 'Сочи', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAYoPwnCCjt-5aoY6OCp2KRUxppKw13FSoECaWDOdKFCOLyqvzp07L3VAZhKb6WdtwPF70Z8Xmz6IjyWa6jFZ_3HMfeo07WHYvcKM3LZSlcHF_khbPSmzTJWqresH5ew1lopz8CsfDe49mvE4IYCZNO4s7rzKYD2ESxeHTc_W6Hz0jDOGFExcYDD2H_xyy061Ioquh_nBt7p8vRaSOr4oLoT0ZhLIjDDAlSkkjm8th8Zxajb9T6VjCRpcgg3vv0l8oThe4C8pQCQtE'),
    ('Комплекс «Гранит»', 'Карельский гранит', 'Майкоп', 'https://lh3.googleusercontent.com/aida-public/AB6AXuB3TQzYLSdzTQdNcPY6wjwxodpJa75sDp0ERJGMEq6VSWhAaSauc8QElqTGJv1tM2IBG2fzfW4_R26FMZNSAdQW6kqSG3mtl8fORv0oRPQtVhODMtwykuZ4ywctIoO8G0rVx_QAaZR7OIsiGyaAiAJRC5__hbHWGIIjkcp0EmdMKV1XyAr3PQpiMN-WeYxQvO4xerRyZFeF80lDyupwaZh7ayfRbRpMCmZ8l7ViHcBmRER1uhEPzsjv4DAV9tozO4mIAGifKhqyYZc'),
    ('Стела СВО', 'Габбро-диабаз', 'Новороссийск', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAgvw2kR9xjYR1qZFqAw6VLhSVTBRdkhzWSCN-es1BE7vQexs0NZLlAffScbIJFRwx5P_JgJ_yaD3V4xMnYmaHlGEz0egw6SMmMW2JA_F7rbz229ankKaQponl19MUwaiPwpPmnXXvGjAilZY5JlP1xBg63uZPV1gZ5uxYvGCKQGakjGcxS9neLa_d0UvkWxoPpGwHAXb4cCHbelFPZS6eLFeO-pQ0x_BxHUCseTGQ6BVkn8liYZRm3TK6MKZgnA2qDlroxu4LXlKE'),
    ('Элитный комплекс', 'Лабрадорит', 'Геленджик', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBp5PNc0_Q_J0U4AUnI6Bi8JHDBXek3hIovTRXhli0LqGnhMtPkj-81Zl6gODI-2-0yHx4uht_zs8dM9HRITKVTFVtmBEEpT_z_11jBJmLUL_9MG0K0nqPspCdhpbcyC0zD0bqAf5B1Hdn1_IgUvw-Lbe42nrRmA_KBDaDc2ui0w5tVr57iRzhOJdM86HsVk1ap2Ur_uys-5qM6U8n8_ngjZSjPhDKJx9XZTcLSUWfEV34QxiM1Gu8DSHtIsVL1kPqtXeEMW77Xd34'),
]


class Command(BaseCommand):
    help = 'Seed demo data for ИП Чепелов'

    def add_arguments(self, parser):
        parser.add_argument(
            '--if-empty',
            action='store_true',
            help='Заполнить каталог только если в БД ещё нет товаров',
        )

    def handle(self, *args, **options):
        if options.get('if_empty'):
            already = (
                Category.objects.exists()
                and Product.objects.exists()
                and PortfolioItem.objects.exists()
                and OfficeLocation.objects.exists()
            )
            if already:
                self.stdout.write(self.style.WARNING('Каталог уже заполнен — seed пропущен.'))
                return

            # Частично пустая БД: дозаполняем только отсутствующие сущности без wipe
            if (
                Category.objects.exists()
                or Product.objects.exists()
                or PortfolioItem.objects.exists()
                or OfficeLocation.objects.exists()
                or Review.objects.exists()
            ):
                self._seed_missing()
                return

        Category.objects.all().delete()
        Product.objects.all().delete()
        Review.objects.all().delete()
        PortfolioItem.objects.all().delete()
        OfficeLocation.objects.all().delete()

        self._seed_all()
        self.stdout.write(self.style.SUCCESS('Database seeded successfully.'))

    def _seed_missing(self):
        if not Category.objects.exists():
            self._create_categories()
        if not Product.objects.exists():
            self._create_products()
        if not Review.objects.exists():
            self._create_reviews()
        if not PortfolioItem.objects.exists():
            self._create_portfolio()
        if not OfficeLocation.objects.exists():
            self._create_locations()
        self.stdout.write(self.style.SUCCESS('Missing demo data filled.'))

    def _seed_all(self):
        self._create_categories()
        self._create_products()
        self._create_reviews()
        self._create_portfolio()
        self._create_locations()

    def _create_categories(self):
        for index, (slug, title, price_from, image_url) in enumerate(CATEGORIES):
            Category.objects.create(
                slug=slug,
                title=title,
                price_from=price_from,
                image_url=image_url,
                sort_order=index,
            )

    def _create_products(self):
        category = Category.objects.filter(slug='granite-monuments').first()
        for product in PRODUCTS:
            sku, slug, name, material, style, product_type, material_label, price, image_url, dimensions, finish, featured = product
            Product.objects.create(
                sku=sku,
                slug=slug,
                name=name,
                material=material,
                style=style,
                product_type=product_type,
                material_label=material_label,
                price=price,
                image_url=image_url,
                dimensions=dimensions,
                finish=finish,
                featured=featured,
                category=category,
                description=f'Премиальный памятник «{name}» из коллекции KavkazKamen.',
            )

    def _create_reviews(self):
        for index, (author, text, rating, image_url, is_video) in enumerate(REVIEWS):
            Review.objects.create(
                author=author,
                text=text,
                rating=rating,
                image_url=image_url,
                is_video=is_video,
                sort_order=index,
            )

    def _create_portfolio(self):
        for index, (title, material, city, image_url) in enumerate(PORTFOLIO):
            PortfolioItem.objects.create(
                title=title,
                material=material,
                city=city,
                image_url=image_url,
                sort_order=index,
            )

    def _create_locations(self):
        for slug, city, address, phone, lat, lng, hq, highlighted, region, projects, description in LOCATIONS:
            OfficeLocation.objects.create(
                slug=slug,
                city=city,
                address=address,
                phone=phone,
                latitude=lat,
                longitude=lng,
                is_headquarters=hq,
                is_highlighted=highlighted,
                region=region,
                projects_count=projects,
                description=description,
            )
