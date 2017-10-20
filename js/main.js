/**
 * Created by Peter Ryszkiewicz (https://github.com/pRizz) on 9/10/2017.
 * https://github.com/pRizz/iota-transaction-spammer-webapp
 */

const hostingSite = 'https://github.com/pRizz/iota-transaction-spammer-webapp'
let message = `This spam was generated by the transaction spammer: ${hostingSite}`
const significantFigures = 3

const tangleExplorers = [
    {
        name: 'open-iota.prizziota.com',
        urlLessHash: 'http://open-iota.prizziota.com/#/search/tx/'
    },
    {
        name: 'iotasear.ch',
        urlLessHash: 'https://iotasear.ch/hash/'
    },
    {
        name: 'thetangle.org',
        urlLessHash: 'https://thetangle.org/transaction/'
    },
    {
        name: 'www.iota.tips',
        urlLessHash: 'http://www.iota.tips/search/?kind=transaction&hash='
    },
    {
        name: 'iota.codebuffet.co',
        urlLessHash: 'https://iota.codebuffet.co/#/search/'
    },
]

function millisecondsToHHMMSSms(milliseconds) {
    const sec_num = parseInt(`${milliseconds / 1000}`, 10); // don't forget the second param
    let hours   = Math.floor(sec_num / 3600);
    let minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    let seconds = sec_num - (hours * 3600) - (minutes * 60);
    let millisecondsNum = milliseconds % 1000

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    if (millisecondsNum < 10) {
        millisecondsNum = `00${millisecondsNum}`
    } else if (millisecondsNum < 100) {
        millisecondsNum = `0${millisecondsNum}`
    }
    return `${hours}:${minutes}:${seconds}:${millisecondsNum}`
}

function toggleNightMode() {
    $("body").toggleClass('night-mode')
    $("pre").toggleClass('night-mode')
    $(".panel").toggleClass('night-mode')
    $("img").toggleClass('inverted-image')
}

$(function(){
    iotaTransactionSpammer.options({
        message: message
    })

    iotaTransactionSpammer.eventEmitter.on('state', function(state) {
        console.log(`${new Date().toISOString()} New state: ${state}`)
        $('#eventLogContent').prepend(`<div>${new Date().toISOString()}: ${state}</div>`)
    })

    iotaTransactionSpammer.eventEmitter.on('transactionCountChanged', function(transactionCount) {
        $('#transactionCount')[0].innerText = transactionCount
    })

    iotaTransactionSpammer.eventEmitter.on('confirmationCountChanged', function(confirmationCount) {
        $('#confirmationCount')[0].innerText = confirmationCount
    })

    iotaTransactionSpammer.eventEmitter.on('averageConfirmationDurationChanged', function(averageConfirmationDuration) {
        $('#averageConfirmationDuration')[0].innerText = (averageConfirmationDuration / 1000).toFixed(significantFigures)
    })

    iotaTransactionSpammer.eventEmitter.on('transactionCompleted', function(success) {
        success.forEach(element => {
            const tangleExplorerLinks = tangleExplorers.map(tangleExplorer => {
                const tangleExplorerTransactionURL = `${tangleExplorer.urlLessHash}${element.hash}`
                return `<a href="${tangleExplorerTransactionURL}" target="_blank">${tangleExplorer.name}</a>`
            }).join(' – ')

            $('#eventLogContent').prepend(`<div>${new Date().toISOString()}: View transaction details at: ${tangleExplorerLinks}</div>`)

            $('#eventLogContent').prepend(`<div>${new Date().toISOString()}: New transaction created with hash: ${element.hash}</div>`)
        })
    })

    $('#loadBalanceCheckbox').prop('checked', iotaTransactionSpammer.options().isLoadBalancing)

    iotaTransactionSpammer.startSpamming()

    const startMilliseconds = Date.now()

    function durationInMinutes() {
        return durationInSeconds() / 60
    }

    function durationInSeconds() {
        return durationInMilliseconds() / 1000
    }

    function durationInMilliseconds() {
        return Date.now() - startMilliseconds
    }

    function updateTransactionsPerMinute() {
        $('#transactionsPerMinuteCount')[0].innerText = (iotaTransactionSpammer.getTransactionCount() / durationInMinutes()).toFixed(significantFigures)
    }
    function updateConfirmationsPerMinute() {
        const durationInMilliseconds = Date.now() - startMilliseconds
        $('#confirmationsPerMinuteCount')[0].innerText = (iotaTransactionSpammer.getConfirmationCount() / durationInMinutes()).toFixed(significantFigures)
    }
    function updateTimer() {
        $('#timeSpentSpamming')[0].innerText = millisecondsToHHMMSSms(durationInMilliseconds())
    }

    $('#settingsModal').on('hidden.bs.modal', function() {
        iotaTransactionSpammer.options({
            customProvider: $('#customHost')[0].value,
            isLoadBalancing: $('#loadBalanceCheckbox').is(':checked')
        })
    })

    setInterval(function(){
        updateTimer()
    }, 50)

    setInterval(function(){
        updateTransactionsPerMinute()
        updateConfirmationsPerMinute()
    }, 1000)

})

const app = angular.module("transactionSpammerApp", [])
app.controller("settingsController", function($scope) {
    $scope.hostList = iotaTransactionSpammer.validProviders
    $scope.selectedHost = iotaTransactionSpammer.options().provider
    $scope.$watch('selectedHost', (newValue) => {
        iotaTransactionSpammer.options({
            provider: newValue
        })
    })
    $scope.customHost = ""
})
