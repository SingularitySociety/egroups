import { should } from 'chai';
import * as logger from '../src/utils/logger';

should()

describe("logger test", () => {
  it("logger", async () => {
    const res = logger.error_response({log: "a", message: "b"});
    res.should.deep.equal({
      result: false, error: {
        message: 'b',
        type: 'Error',
        error_message: 'a'
      }
    })

    const res2 = logger.error_response({log: {"a": "1"}, message: "b"});
    res2.should.deep.equal({
      result: false,
      error: {
        message: 'b',
        type: 'Error',
        error_message: { "a": "1"}
      }
    })

    const res3 = logger.error_response({func: "hello", error_type: logger.ErrorTypes.HelloError, message: "b"});
    res3.should.deep.equal({ result: false,
                             error: { 
                               message: 'b',
                               type: 'Error',
                               error_message: 'hello error: hello error'
                             }
                           })

    const error_handler = logger.error_response_handler({func: "error_handler", message: "c"});
    const res4 = error_handler({error_type: logger.ErrorTypes.HelloError});
    res4.should.deep.equal({ result: false,
                             error: {
                               message: 'c',
                               type: 'Error',
                               error_message: 'error_handler error: hello error'
                             }
                           })
  });
});