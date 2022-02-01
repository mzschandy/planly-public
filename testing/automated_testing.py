import time
from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException
import unittest
import pytest
import pytest_html
import HtmlTestRunner

class AutomatedTesting(unittest.TestCase):
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

    # sign up
    def test_TC_01(self):
        self.driver.get('http://localhost:3000/')
        # self.driver.get('https://development-planly.herokuapp.com/')
        time.sleep(1)
        test_first_name = "First"
        test_last_name = "Last"
        test_email = "plan.ly.selenium@gmail.com"
        test_username = "selenium_testing"
        test_password = "selenium123!"
        self.driver.find_element_by_xpath('//*[@id="nav-website"]/nav/div/a[1]').click() #click log in
        self.driver.find_element_by_xpath('//*[@id="authorization"]/div/div[2]/div/div/div[3]/div/button').click() #click sign up
        self.driver.find_element_by_xpath('//*[@id="authorization"]/div/div[2]/div/div/div[2]/form/div[1]/div[1]/input').send_keys(test_first_name) #first name
        self.driver.find_element_by_xpath('//*[@id="authorization"]/div/div[2]/div/div/div[2]/form/div[1]/div[2]/input').send_keys(test_last_name) #last name
        self.driver.find_element_by_xpath('//*[@id="authorization"]/div/div[2]/div/div/div[2]/form/div[2]/input').send_keys(test_email) #email
        self.driver.find_element_by_xpath('//*[@id="authorization"]/div/div[2]/div/div/div[2]/form/div[3]/input').send_keys(test_username) #username
        self.driver.find_element_by_xpath('//*[@id="authorization"]/div/div[2]/div/div/div[2]/form/div[4]/input').send_keys(test_password) #password
        time.sleep(1) 
        self.driver.find_element_by_xpath('//*[@id="authorization"]/div/div[2]/div/div/div[2]/form/button').click()
        time.sleep(3)

    # log in
    def test_TC_02(self): 
        self.logIn()
        time.sleep(3)

    # log out
    def test_TC_03(self): 
        self.logIn()
        time.sleep(2)
        self.driver.find_element_by_xpath('//*[@id="nav-app"]/nav/div').click()
        time.sleep(1)
        self.driver.find_element_by_xpath('/html/body/div[2]/div[2]/button').click()
        time.sleep(1)

    # from log out cannot go back in windows history to log back in without entering password
    def test_TC_04(self):
        self.logIn()
        time.sleep(2)
        self.driver.find_element_by_xpath('//*[@id="nav-app"]/nav/div').click()
        time.sleep(1)
        self.driver.find_element_by_xpath('/html/body/div[2]/div[2]/button').click()
        time.sleep(1)
        try:
            is_logged_in = self.driver.find_element_by_xpath('//*[@id="nav-app"]/nav/div').size()
        except NoSuchElementException:
            time.sleep(1)
        time.sleep(1)

    # test that user can create an event
    def test_TC_05(self):
        self.logIn()
        time.sleep(2)
        # click create event button
        self.driver.find_element_by_xpath('//*[@id="page-content"]/div[1]/div[2]/div/div/button/div').click()
        # enter event details
        # driver.find_element_by_xpath('//*[@id="event-modal"]/form/div/input').click()
        time.sleep(2)
        self.driver.find_element_by_xpath('/html/body/div[3]/div/div/div[2]/form/div[1]/input').send_keys("Space Party")
        self.driver.find_element_by_xpath('/html/body/div[3]/div/div/div[2]/form/div[2]/textarea').send_keys("Were all going to SPACE!! Get your helmet ready!!")
        self.driver.find_element_by_xpath('/html/body/div[3]/div/div/div[2]/form/div[3]/input').send_keys("Lunar cheese ball")
        self.driver.find_element_by_xpath('/html/body/div[3]/div/div/div[2]/form/div[4]/input').send_keys("11/19/2021")
        self.driver.find_element_by_xpath('/html/body/div[3]/div/div/div[2]/form/div[5]/input').send_keys("11/26/2021")
        self.driver.find_element_by_xpath('/html/body/div[3]/div/div/div[3]/button[2]').click()
        time.sleep(1)

    # update an event
    def test_TC_06(self):
        self.logIn()
        time.sleep(2) # wait for the event feed to load
        # click on first event in event feed
        self.driver.find_element_by_xpath('//*[@id="page-content"]/div[2]/div[2]').click()
        time.sleep(1)
        # self.driver.find_element_by_xpath('//*[@id="root"]/div/div/div[4]/div[2]/div/button/span').click()
        self.driver.find_element_by_xpath('//button[normalize-space()="Edit Event Details"]').click()
        # update event fields
        updated_event = 'Updated Event'
        updated_desc = 'Updated Description'
        updated_loc = 'Updated Location'
        updated_date1 = '11/11/2022'
        updated_date2 = '11/22/2022'
        self.driver.find_element_by_xpath('/html/body/div[3]/div/div/div[2]/form/div[1]/input').clear()
        self.driver.find_element_by_xpath('/html/body/div[3]/div/div/div[2]/form/div[1]/input').send_keys(updated_event)
        self.driver.find_element_by_xpath('/html/body/div[3]/div/div/div[2]/form/div[2]/textarea').clear()
        self.driver.find_element_by_xpath('/html/body/div[3]/div/div/div[2]/form/div[2]/textarea').send_keys(updated_desc)
        self.driver.find_element_by_xpath('/html/body/div[3]/div/div/div[2]/form/div[3]/input').clear()
        self.driver.find_element_by_xpath('/html/body/div[3]/div/div/div[2]/form/div[3]/input').send_keys(updated_loc)
        self.driver.find_element_by_xpath('/html/body/div[3]/div/div/div[2]/form/div[4]/input').clear()
        self.driver.find_element_by_xpath('/html/body/div[3]/div/div/div[2]/form/div[4]/input').send_keys(updated_date1)
        self.driver.find_element_by_xpath('/html/body/div[3]/div/div/div[2]/form/div[5]/input').clear()
        self.driver.find_element_by_xpath('/html/body/div[3]/div/div/div[2]/form/div[5]/input').send_keys(updated_date2)
        time.sleep(1)
        # self.driver.find_element_by_xpath('/html/body/div[3]/div/div/div[3]/button[2]').click()
        self.driver.find_element_by_xpath('//button[normalize-space()="Save"]').click()
        time.sleep(1)
        # check event is updated
        # element = self.driver.find_element_by_xpath('//*[@id="event-content"]/div[1]/div[1]/div[1]/h1').text
        # assert element == updated_event
        time.sleep(1) 

    # add an invitee
    def test_TC_07(self):
        self.logIn()
        time.sleep(3)
        # find the last event created
        self.driver.find_element_by_xpath('//*[@id="page-content"]/div[2]/div[2]').click()
        time.sleep(3)
        self.driver.find_element_by_xpath('//button[normalize-space()="Add Invitee"]').click()
        time.sleep(1)
        invitee = 'mtdowding@gmail.com'
        self.driver.find_element_by_xpath('//*[@id="invitee_input"]').send_keys(invitee)
        self.driver.find_element_by_xpath('//button[normalize-space()="Add"]').click()
        time.sleep(1)
        self.driver.find_element_by_xpath('//button[normalize-space()="Send Invitee"]').click()
        time.sleep(3)
        # check that the correct invitee was added as is now an invitee
        added_invitee = self.driver.find_element_by_xpath('//*[@id="page-content"]/div[2]/div[2]/div[2]/div[2]').text
        assert added_invitee == 'Matt Dowding'
        time.sleep(1)

    # edit an invitee's ownership status
    def test_TC_08(self):
        self.logIn()    
        time.sleep(3)
        # find the last event created
        self.driver.find_element_by_xpath('//*[@id="page-content"]/div[2]/div[2]').click()
        time.sleep(3)
        # check that the correct invitee was is an invitee
        added_invitee = self.driver.find_element_by_xpath('//*[@id="page-content"]/div[2]/div[2]/div[2]/div[2]').text
        assert added_invitee == 'Matt Dowding'
        # check invitee ownership status
        self.driver.find_element_by_xpath('//*[@id="page-content"]/div[2]/div[2]/div[2]/div[1]').click()
        time.sleep(1)
        added_invitee_status = self.driver.find_element_by_xpath('/html/body/div[2]/div[2]/div').text
        assert added_invitee_status == 'Matt Dowding: Guest'
        self.driver.find_element_by_xpath('//button[normalize-space()="Toggle"]').click()
        time.sleep(1)
        added_invitee_status = self.driver.find_element_by_xpath('/html/body/div[2]/div[2]/div').text
        assert added_invitee_status == 'Matt Dowding: Co-Owner'
        time.sleep(1)

    # make a new task list
    def test_TC_09(self):
        self.logIn()
        time.sleep(3)
        # click on first event in event feed
        self.driver.find_element_by_xpath('//*[@id="page-content"]/div[2]/div[2]').click()
        time.sleep(1)
        self.driver.find_element_by_xpath('//*[@id="newListHeader"]').click()
        time.sleep(1)
        self.driver.find_element_by_xpath('//*[@id="newListForm"]/form/input[1]').send_keys('New Task List')
        self.driver.find_element_by_xpath('//*[@id="newListForm"]/form/input[2]').send_keys('Task Description')
        self.driver.find_element_by_xpath('//button[normalize-space()="Create List"]').click()
        time.sleep(1)

    # make a new task
    def test_TC_10(self):
        self.logIn()
        time.sleep(3)
        # click on first event in event feed
        self.driver.find_element_by_xpath('//*[@id="page-content"]/div[2]/div[2]').click()
        time.sleep(1)
        self.driver.find_element_by_xpath('//*[@id="newTaskHeader0"]').click()
        time.sleep(1)
        self.driver.find_element_by_xpath('//*[@id="newTaskHeader0Form"]/form/input').send_keys('New Task')
        self.driver.find_element_by_xpath('//*[@id="newTaskHeader0Form"]/form/select').click()
        time.sleep(1)
        self.driver.find_element_by_xpath('//*[@id="newTaskHeader0Form"]/form/select/option[2]').click()
        time.sleep(1)
        self.driver.find_element_by_xpath('//button[normalize-space()="Create Task"]').click()
        time.sleep(1)

    # delete the task
    def test_TC_11(self):
        self.logIn()
        time.sleep(3)
        self.driver.find_element_by_xpath('//*[@id="page-content"]/div[2]/div[2]').click()
        time.sleep(1)
        self.driver.find_element_by_xpath('//*[@id="page-content"]/div[3]/div/div[1]/div[3]/div/div[1]').click()
        time.sleep(1)
        self.driver.find_element_by_xpath('//*[@id="page-content"]/div[3]/div/div[1]/div[3]/div/div[1]/i').click()
        time.sleep(1)

    # delete the task list
    def test_TC_12(self):
        self.logIn()
        time.sleep(3)
        self.driver.find_element_by_xpath('//*[@id="page-content"]/div[2]/div[2]').click()
        time.sleep(1)
        self.driver.find_element_by_xpath('//*[@id="page-content"]/div[3]/div/div[1]/div[1]').click()
        time.sleep(1)
        self.driver.find_element_by_xpath('//*[@id="page-content"]/div[3]/div/div[1]/div[1]/i').click()
        time.sleep(1)
    
    # delete an invitee
    def test_TC_13(self):
        self.logIn()
        time.sleep(3)
        # find the last event created
        self.driver.find_element_by_xpath('//*[@id="page-content"]/div[2]/div[2]').click()
        time.sleep(3)
        # check that the correct invitee was is an invitee
        added_invitee = self.driver.find_element_by_xpath('//*[@id="page-content"]/div[2]/div[2]/div[2]/div[2]').text
        assert added_invitee == 'Matt Dowding'
        # uninvite
        self.driver.find_element_by_xpath('//*[@id="page-content"]/div[2]/div[2]/div[2]/div[1]').click()
        time.sleep(1)
        self.driver.find_element_by_xpath('//button[normalize-space()="Uninvite"]').click()
        time.sleep(1)
        try:
            is_logged_in = self.driver.find_element_by_xpath('//*[@id="page-content"]/div[2]/div[2]/div[2]/div[2]').size()
        except NoSuchElementException:
            time.sleep(1)
        time.sleep(1)


    # delete an event
    def test_TC_14(self):
        self.logIn()
        time.sleep(3)
        #find the last event created
        self.driver.find_element_by_xpath('//*[@id="page-content"]/div[2]/div[2]').click()
        time.sleep(3)
        # self.driver.find_element_by_xpath('//button[normalize-space()="Delete"]').click()
        self.driver.find_element_by_xpath('//*[@id="page-content"]/div[1]/div[1]/div[2]/i').click()
        time.sleep(1)
        # make sure the event was deleted
        try:
            is_logged_in = self.driver.find_element_by_xpath('//*[@id="events"]/div/div/div/div/div/div[2]/a/div/div/h3').size()
        except NoSuchElementException:
            time.sleep(1)
        time.sleep(1)


    def tearDown(self):
        self.driver.quit() # close testing

if __name__ == '__main__':
    # unittest.main()    
    unittest.main(testRunner=HtmlTestRunner.HTMLTestRunner(output='C:/Users/Matthew/Desktop/project673/main/BUMETCS673S21T1/testing/test_reports'))

