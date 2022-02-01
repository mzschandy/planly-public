import time
from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException
import unittest
import pytest
import pytest_html
# import HtmlTestRunner

class WebpageTesting(unittest.TestCase):
    def setUp(self):
    #initiallize web driver

        # need full driver path to run HtmlTestRunner
        self.driver = webdriver.Chrome(executable_path='C:/Users/Matthew/Desktop/project673/main/BUMETCS673S21T1/testing/chromedriver.exe')
        # self.driver = webdriver.Chrome(executable_path='testing/chromedriver.exe')
        # driver = webdriver.Firefox(executable_path='testing/geckodriver.exe')

    # create login function
    def logIn(self):
        self.driver.get('http://localhost:3000/') #go to homepage
        # self.driver.get('https://development-planly.herokuapp.com/') #go to homepage
        test_username = "selenium_testing"
        test_password = "selenium123!"
        # click the login page and input login credentials.
        self.driver.find_element_by_xpath('//*[@id="nav-website"]/nav/div/a[1]').click()
        self.driver.find_element_by_xpath('//*[@id="username"]').send_keys(test_username)
        self.driver.find_element_by_xpath('//*[@id="password"]').send_keys(test_password)
        self.driver.find_element_by_xpath('//*[@id="authorization"]/div/div[2]/div/div/div[2]/form/button').click()
        time.sleep(1)

    def test_1_homepage(self):
        self.driver.get('http://localhost:3000/')
        time.sleep(1)
        # log in button
        log_in = self.driver.find_element_by_xpath('//*[@id="nav-website"]/nav/div/a[1]').text
        assert log_in == 'Log In'
        # sign up button
        sign_up = self.driver.find_element_by_xpath('//*[@id="signUp"]').text
        assert sign_up == 'Sign Up'
        # start planning button
        start_planning = self.driver.find_element_by_xpath('//*[@id="product"]/div/div[1]/div/div[2]/a').text
        assert start_planning == 'Starting Planning'
        # plan.ly hompage button
        homepage = self.driver.find_element_by_xpath('//*[@id="nav-website"]/nav/span/a').text
        assert homepage == 'Plan.ly'

    def test_2_dashboard(self):
        self.logIn()
        time.sleep(3)
        # plan.ly hompage button
        homepage = self.driver.find_element_by_xpath('//*[@id="nav-app"]/nav/span/a').text
        assert homepage == 'Plan.ly'
        # logout button
        self.driver.find_element_by_xpath('//*[@id="nav-app"]/nav/div/div').click()
        log_out = self.driver.find_element_by_xpath('/html/body/div[2]/div[2]/button').text
        assert log_out == 'Logout'
        # add event button
        add_event = self.driver.find_element_by_xpath('//*[@id="page-content"]/div[1]/div[2]/div/div/button/div').text
        assert add_event == 'Add New Event'
        # check calendar functionality
        month = self.driver.find_element_by_xpath('//*[@id="events"]/div/div[2]/div/div/div[1]/div[1]/h2').text
        assert month == 'April 2021'
        self.driver.find_element_by_xpath('//*[@id="events"]/div/div[2]/div/div/div[1]/div[3]/div/button[2]/span').click()
        month2 = self.driver.find_element_by_xpath('//*[@id="events"]/div/div[2]/div/div/div[1]/div[1]/h2').text
        assert month2 == 'May 2021'
        self.driver.find_element_by_xpath('//*[@id="events"]/div/div[2]/div/div/div[1]/div[3]/div/button[1]/span').click()
        month3 = self.driver.find_element_by_xpath('//*[@id="events"]/div/div[2]/div/div/div[1]/div[1]/h2').text
        assert month3 == 'April 2021'
        self.driver.find_element_by_xpath('//*[@id="events"]/div/div[2]/div/div/div[1]/div[3]/div/button[2]/span').click()
        self.driver.find_element_by_xpath('//*[@id="events"]/div/div[2]/div/div/div[1]/div[3]/div/button[2]/span').click()
        self.driver.find_element_by_xpath('//*[@id="events"]/div/div[2]/div/div/div[1]/div[3]/div/button[2]/span').click()
        self.driver.find_element_by_xpath('//*[@id="events"]/div/div[2]/div/div/div[1]/div[3]/button').click()
        month3 = self.driver.find_element_by_xpath('//*[@id="events"]/div/div[2]/div/div/div[1]/div[1]/h2').text
        assert month3 == 'April 2021'

    def test_3_event(self):
        self.logIn()
        time.sleep(2)
        self.driver.find_element_by_xpath('//*[@id="page-content"]/div[2]/div[2]').click()
        time.sleep(2)
        # plan.ly hompage button
        homepage = self.driver.find_element_by_xpath('//*[@id="nav-app"]/nav/span/a').text
        assert homepage == 'Plan.ly'
        # logout button
        self.driver.find_element_by_xpath('//*[@id="nav-app"]/nav/div/div').click()
        log_out = self.driver.find_element_by_xpath('/html/body/div[2]/div[2]/button').text
        assert log_out == 'Logout'
        # add invitee
        add_invitee = self.driver.find_element_by_xpath('//*[@id="page-content"]/div[2]/div[1]/div/button').text
        assert add_invitee == 'Add Invitee'
        self.driver.find_element_by_xpath('//*[@id="page-content"]/div[2]/div[1]/div/button').click()
        add = self.driver.find_element_by_xpath('/html/body/div[3]/div/div/div[2]/form/div/div/div[2]/button').text
        assert add == 'Add'
        send = self.driver.find_element_by_xpath('//*[@id="Btn_check"]').text
        assert send == 'Send Invitee'
        close = self.driver.find_element_by_xpath('/html/body/div[3]/div/div/div[3]/button[1]').text
        assert close == 'Close'
        self.driver.find_element_by_xpath('/html/body/div[3]/div/div/div[1]/button/span[1]').click()
        # edit event
        edit_event = self.driver.find_element_by_xpath('//*[@id="page-content"]/div[1]/div[1]/div[2]/div/button/span').text
        assert edit_event == 'Edit Event Details'
        self.driver.find_element_by_xpath('//*[@id="page-content"]/div[1]/div[1]/div[2]/div/button/span').click()
        edit_event2 = self.driver.find_element_by_xpath('//*[@id="event-content"]/div[1]/div[1]/div[2]/div/button').text
        assert edit_event2 == 'Edit Event Details'
        self.driver.find_element_by_xpath('/html/body/div[3]/div/div/div[1]/button/span[1]').click()
        # check menu
        # home = self.driver.find_element_by_xpath('//*[@id="sideNav"]/div/div[1]/a').text
        # assert home == 'Home'
        # events = self.driver.find_element_by_xpath('//*[@id="sideNav"]/div/div[2]/a').text
        # assert events == 'Events'
        # calendar = self.driver.find_element_by_xpath('//*[@id="sideNav"]/div/div[3]/a').text
        # assert calendar == 'Calendar'


    def tearDown(self):
        self.driver.quit() # close testing

if __name__ == '__main__':
    unittest.main()    
    # unittest.main(testRunner=HtmlTestRunner.HTMLTestRunner(output='C:/Users/Matthew/Desktop/project673/main/BUMETCS673S21T1/testing/test_reports'))
