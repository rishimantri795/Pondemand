import bs4 as bs
import requests
import selenium
import pandas as pd
import numpy as np
import summarize


link = 'https://brutalist.report/?limit=10'


def scrape_publications(link):
    articles = pd.DataFrame(columns=['Num','Article', 'Link', 'Publication', 'Summary'])
    source = requests.get(link).text
    soup = bs.BeautifulSoup(source, 'html.parser')
    h3_tags = soup.find_all('h3')

    articlenum = 0
    #print(h3_tags)

    for h3_tag in h3_tags:
        a_tag = h3_tag.find('a')
        
        next_10_li_tags = []
        current_tag = h3_tag
        for i in range(10):
            print(current_tag.find_next('li'))
            current_tag = current_tag.find_next('li')
            next_10_li_tags.append(current_tag)
            new_a_tag = current_tag.find('a')
            try:
                articles = articles._append({'Num': articlenum, 'Article': new_a_tag.text, 'Link': new_a_tag['href'], 'Publication': f'{a_tag.text}'}, ignore_index=True)
                articlenum += 1
            except:
                print('error')
        
    print(articles)
    articles.to_csv('articles2.csv', index=False)
    return articles               


def main():
    articles = scrape_publications(link)
    #summarize(articles)

if __name__ == '__main__':
    main()

